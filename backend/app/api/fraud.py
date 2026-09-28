import json
from datetime import datetime, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_roles
from app.crud import fraud as crud
from app.crud.base import get_list, get_object, update_object
from app.db.session import get_db
from app.models.alert import ALERT_STATUSES, Alert
from app.models.customer import Customer
from app.models.customer_risk_profile import CustomerRiskProfile
from app.models.investigation import Investigation
from app.models.model_feedback import ModelFeedback
from app.models.report import AuditLog, Report
from app.models.risk_assessment import RiskAssessment
from app.models.transaction import Transaction
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.schemas.fraud import (AlertCreate, AlertOut, AlertUpdate, AuditLogOut, InvestigationCreate,
                               InvestigationOut, InvestigationUpdate, ModelFeedbackCreate,
                               ModelFeedbackOut, ReportOut)
from app.schemas.risk import CustomerRiskProfileOut, RiskAssessmentOut
from app.schemas.transaction import TransactionOut
from app.utils.datetime import parse_dt, utcnow

router = APIRouter()


# ---------- Customers ----------
@router.get("/customers", response_model=dict)
def list_customers(db: Session = Depends(get_db), user=Depends(get_current_user),
                   page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                   search: str | None = None):
    result = get_list(db, Customer, page=page, page_size=page_size, search=search,
                      search_fields=("external_id", "email", "full_name"))
    result["items"] = [CustomerOut.model_validate(c).model_dump() for c in result["items"]]
    return result


@router.post("/customers", response_model=CustomerOut, status_code=201)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db),
                    user=Depends(require_roles("admin", "business_manager"))):
    exists = db.query(Customer).filter(Customer.external_id == data.external_id).first()
    if exists:
        raise HTTPException(409, "Customer external_id already exists")
    c = Customer(id=str(uuid4()), **data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/customers/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    c = db.query(Customer).filter((Customer.id == customer_id) |
                                  (Customer.external_id == customer_id)).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    return c


@router.get("/customers/{customer_id}/risk-profile", response_model=CustomerRiskProfileOut)
def get_customer_risk_profile(
    customer_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Retrieves the dynamic AI CustomerRiskProfile row for a customer (404 if not yet scored)."""
    c = db.query(Customer).filter((Customer.id == customer_id) |
                                  (Customer.external_id == customer_id)).first()
    target_id = c.id if c else customer_id
    profile = db.query(CustomerRiskProfile).filter(CustomerRiskProfile.customer_id == target_id).first()
    if not profile:
        raise HTTPException(404, f"No risk profile found for customer '{customer_id}'")
    return profile


@router.patch("/customers/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: str, data: CustomerUpdate, db: Session = Depends(get_db),
                    user=Depends(require_roles("admin", "business_manager"))):
    c = get_object(db, Customer, customer_id)
    return update_object(db, c, data.model_dump(exclude_unset=True))


@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db),
                    user=Depends(require_roles("admin"))):
    c = get_object(db, Customer, customer_id)
    db.delete(c)
    db.commit()
    return {"deleted": True, "id": customer_id}


# ---------- Alerts ----------
@router.get("/alerts", response_model=dict)
def list_alerts(db: Session = Depends(get_db), user=Depends(get_current_user),
                page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                status: str | None = None, severity: str | None = None,
                customer_id: str | None = None):
    filters = {}
    if status:
        filters["status"] = status
    if severity:
        filters["severity"] = severity
    if customer_id:
        filters["customer_id"] = customer_id
    result = get_list(db, Alert, page=page, page_size=page_size, filters=filters)
    result["items"] = [AlertOut.model_validate(a).model_dump() for a in result["items"]]
    return result


@router.get("/alerts/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_object(db, Alert, alert_id)


@router.post("/alerts", response_model=AlertOut, status_code=201)
def create_alert(data: AlertCreate, db: Session = Depends(get_db),
                 user=Depends(require_roles("admin", "business_manager", "analyst"))):
    txn = get_object(db, Transaction, data.transaction_id)
    alert = crud.create_alert_for_txn(db, txn, data.title, data.reason, data.severity, user.id)
    return alert


@router.post("/alerts/{alert_id}/review", response_model=AlertOut)
def review_alert(alert_id: str, data: dict, db: Session = Depends(get_db),
                 user=Depends(require_roles("admin", "analyst"))):
    """Review an alert: new | investigating | confirmed_fraud | false_positive | resolved."""
    alert = get_object(db, Alert, alert_id)
    try:
        return crud.review_alert(db, alert, data.get("status", ""), data.get("note"), user)
    except ValueError as e:
        raise HTTPException(400, str(e))


# ---------- Investigations ----------
@router.get("/investigations", response_model=list[InvestigationOut])
def list_investigations(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Investigation).order_by(Investigation.created_at.desc()).limit(100).all()


@router.post("/investigations", response_model=InvestigationOut, status_code=201)
def create_investigation(data: InvestigationCreate, db: Session = Depends(get_db),
                         user=Depends(require_roles("admin", "analyst"))):
    try:
        return crud.create_investigation(db, data.transaction_id, user.id, data.notes)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.patch("/investigations/{inv_id}", response_model=InvestigationOut)
def update_investigation(inv_id: str, data: InvestigationUpdate, db: Session = Depends(get_db),
                         user=Depends(require_roles("admin", "analyst"))):
    inv = get_object(db, Investigation, inv_id)
    updates = data.model_dump(exclude_unset=True)
    if updates.get("status") == "closed":
        inv.closed_at = utcnow()
    return update_object(db, inv, updates)


@router.get("/investigations/{inv_id}")
def get_investigation_detail(
    inv_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Full single-transaction investigation detail view linked to AI risk assessment,
    customer history, and related alerts (Requirement 10).
    """
    inv = get_object(db, Investigation, inv_id)

    # Linked RiskAssessment (joined on transaction_id)
    assessment = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.transaction_id == inv.transaction_id)
        .first()
    )
    risk_data = None
    if assessment:
        risk_data = {
            "id": assessment.id,
            "risk_score": assessment.risk_score,
            "risk_level": assessment.risk_level,
            "decision": assessment.decision,
            "ml_anomaly_score": assessment.ml_anomaly_score,
            "rule_score": assessment.rule_score,
            "customer_behavior_score": assessment.customer_behavior_score,
            "triggered_rules": assessment.triggered_rules,
            "detected_patterns": assessment.detected_patterns,
            "ai_explanation": assessment.ai_explanation,
            "created_at": assessment.created_at,
        }

    # Customer recent transaction history (reusing query logic from transactions.py detail view)
    history = (
        db.query(Transaction)
        .filter(Transaction.customer_id == inv.customer_id, Transaction.id != inv.transaction_id)
        .order_by(Transaction.created_at.desc())
        .limit(20)
        .all()
    )

    # Related alerts for the same transaction or customer
    related_alerts = (
        db.query(Alert)
        .filter((Alert.transaction_id == inv.transaction_id) | (Alert.customer_id == inv.customer_id))
        .order_by(Alert.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "id": inv.id,
        "transaction_id": inv.transaction_id,
        "customer_id": inv.customer_id,
        "analyst_id": inv.analyst_id,
        "status": inv.status,
        "notes": inv.notes,
        "conclusion": inv.conclusion,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
        "closed_at": inv.closed_at,
        "risk_assessment": risk_data,
        "customer_history": [TransactionOut.model_validate(t).model_dump() for t in history],
        "related_alerts": [AlertOut.model_validate(a).model_dump() for a in related_alerts],
    }


# ---------- Model feedback ----------
@router.get("/feedback", response_model=list[ModelFeedbackOut])
def list_feedback(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(ModelFeedback).order_by(ModelFeedback.created_at.desc()).limit(200).all()


@router.post("/feedback", response_model=ModelFeedbackOut, status_code=201)
def create_feedback(data: ModelFeedbackCreate, db: Session = Depends(get_db),
                    user=Depends(require_roles("admin", "analyst"))):
    if data.feedback_label not in ("confirmed_fraud", "false_positive"):
        raise HTTPException(400, "feedback_label must be confirmed_fraud or false_positive")
    fb = ModelFeedback(
        id=str(uuid4()),
        alert_id=data.alert_id,
        transaction_id=data.transaction_id,
        feedback_label=data.feedback_label,
        comment=data.comment,
        created_by=user.id,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


# ---------- Reports ----------
REPORT_TYPES = ["daily_activity", "monthly_activity", "high_risk_customers",
                "high_risk_transactions", "confirmed_fraud", "false_positives",
                "fraud_trends", "geographic", "rule_performance"]

# Accept the short report types sent by the frontend ReportGenerator.
REPORT_TYPE_ALIASES = {
    "daily": "daily_activity",
    "monthly": "monthly_activity",
    "high_risk": "high_risk_customers",
    "geographic": "geographic",
    "rule_performance": "rule_performance",
}


def _period_transactions(db: Session, period_start, period_end) -> list[Transaction]:
    txn_q = db.query(Transaction)
    if period_start:
        txn_q = txn_q.filter(Transaction.created_at >= period_start)
    if period_end:
        txn_q = txn_q.filter(Transaction.created_at <= period_end)
    return txn_q.order_by(Transaction.created_at.desc()).limit(10000).all()


def _daily_breakdown(txns: list[Transaction], flagged_ids: set[str]) -> list[dict]:
    buckets: dict[str, dict] = {}
    for t in txns:
        day = t.created_at.date().isoformat() if t.created_at else "unknown"
        b = buckets.setdefault(day, {"date": day, "transactions": 0, "flagged": 0, "amount": 0.0})
        b["transactions"] += 1
        b["amount"] = round(b["amount"] + (t.amount or 0), 2)
        if t.id in flagged_ids:
            b["flagged"] += 1
    return sorted(buckets.values(), key=lambda b: b["date"])


def _build_report_payload(db: Session, report_type: str, period_start, period_end,
                          risk_threshold: float = 75.0) -> dict:
    txns = _period_transactions(db, period_start, period_end)
    txn_ids = [t.id for t in txns]

    assessment_by_txn: dict[str, RiskAssessment] = {}
    if txn_ids:
        for a in db.query(RiskAssessment).filter(RiskAssessment.transaction_id.in_(txn_ids)).all():
            assessment_by_txn[a.transaction_id] = a

    by_status: dict[str, int] = {}
    for t in txns:
        by_status[t.status] = by_status.get(t.status, 0) + 1

    flagged = [t for t in txns
               if (a := assessment_by_txn.get(t.id)) is not None
               and (a.risk_score or 0) >= risk_threshold]
    flagged_ids = {t.id for t in flagged}
    blocked = [t for t in txns if t.status == "blocked"]

    alert_q = db.query(Alert)
    if period_start:
        alert_q = alert_q.filter(Alert.created_at >= period_start)
    if period_end:
        alert_q = alert_q.filter(Alert.created_at <= period_end)
    alerts = alert_q.limit(5000).all()
    fp_count = sum(1 for a in alerts if a.status == "false_positive")
    confirmed_count = sum(1 for a in alerts if a.status == "confirmed_fraud")
    resolved = fp_count + confirmed_count

    payload = {
        "report_type": report_type,
        "generated_at": utcnow().isoformat(),
        "period": {"start": period_start.isoformat() if period_start else None,
                   "end": period_end.isoformat() if period_end else None},
        "risk_threshold": risk_threshold,
        "total_transactions": len(txns),
        "status_distribution": by_status,
        "total_amount": round(sum(t.amount or 0 for t in txns), 2),
        "flagged_count": len(flagged),
        "blocked_count": len(blocked),
        "flagged_amount": round(sum(t.amount or 0 for t in flagged), 2),
        "false_positive_rate": round(fp_count / resolved * 100, 2) if resolved else 0.0,
    }

    if report_type in ("daily_activity", "monthly_activity", "fraud_trends"):
        payload["daily_breakdown"] = _daily_breakdown(txns, flagged_ids)

    if report_type in ("daily_activity", "monthly_activity", "high_risk_transactions"):
        top = sorted(flagged, key=lambda t: assessment_by_txn[t.id].risk_score, reverse=True)[:100]
        payload["flagged_transactions"] = [
            {"transaction_id": t.txn_external_id or t.id,
             "customer_id": t.customer_id,
             "amount": t.amount,
             "currency": t.currency,
             "status": t.status,
             "risk_score": round(assessment_by_txn[t.id].risk_score, 1),
             "risk_level": assessment_by_txn[t.id].risk_level,
             "decision": assessment_by_txn[t.id].decision,
             "created_at": t.created_at.isoformat() if t.created_at else None}
            for t in top
        ]

    if report_type == "high_risk_customers":
        profiles = (db.query(CustomerRiskProfile, Customer)
                    .join(Customer, CustomerRiskProfile.customer_id == Customer.id)
                    .filter(CustomerRiskProfile.risk_score >= risk_threshold)
                    .order_by(CustomerRiskProfile.risk_score.desc())
                    .limit(100).all())
        payload["customers"] = [
            {"customer_id": c.external_id,
             "name": c.full_name,
             "email": c.email,
             "risk_score": round(p.risk_score, 1),
             "risk_level": p.risk_level,
             "devices_used": p.devices_used_count,
             "locations_used": p.locations_used_count,
             "total_transactions": c.total_transactions,
             "suspicious_transactions": c.suspicious_transactions}
            for p, c in profiles
        ]
        payload["high_risk_customer_count"] = len(payload["customers"])

    if report_type == "geographic":
        geo: dict[str, dict] = {}
        for t in txns:
            key = t.country or "unknown"
            g = geo.setdefault(key, {"country": key, "transactions": 0, "flagged": 0, "amount": 0.0})
            g["transactions"] += 1
            g["amount"] = round(g["amount"] + (t.amount or 0), 2)
            if t.id in flagged_ids:
                g["flagged"] += 1
        payload["geographic_distribution"] = sorted(
            geo.values(), key=lambda g: g["transactions"], reverse=True)

    if report_type == "rule_performance":
        rule_stats: dict[str, dict] = {}
        for a in assessment_by_txn.values():
            for r in (a.triggered_rules or []):
                name = r.get("name", "unknown")
                s = rule_stats.setdefault(name, {"rule": name,
                                                 "severity": r.get("severity"),
                                                 "score_impact": r.get("score_impact"),
                                                 "triggered_count": 0})
                s["triggered_count"] += 1
        payload["rule_performance"] = sorted(
            rule_stats.values(), key=lambda r: r["triggered_count"], reverse=True)
        payload["assessments_analyzed"] = len(assessment_by_txn)

    if report_type in ("confirmed_fraud", "false_positives"):
        wanted = "confirmed_fraud" if report_type == "confirmed_fraud" else "false_positive"
        payload["alerts"] = [
            {"id": a.id, "title": a.title, "severity": a.severity,
             "created_at": str(a.created_at)}
            for a in alerts if a.status == wanted
        ][:100]

    return payload


def _flatten_payload(payload: dict, prefix: str = "") -> list[tuple[str, object]]:
    """Flatten nested report payload into (key, value) rows for CSV export."""
    rows: list[tuple[str, object]] = []
    for k, v in payload.items():
        key = f"{prefix}.{k}" if prefix else str(k)
        if isinstance(v, dict):
            rows.extend(_flatten_payload(v, key))
        elif isinstance(v, list):
            if not v:
                rows.append((key, ""))
            elif all(isinstance(i, dict) for i in v):
                for i, item in enumerate(v):
                    rows.extend(_flatten_payload(item, f"{key}[{i}]"))
            else:
                rows.append((key, json.dumps(v)))
        else:
            rows.append((key, v))
    return rows


@router.get("/reports", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Report).order_by(Report.created_at.desc()).limit(100).all()


@router.post("/reports", response_model=ReportOut, status_code=201)
def generate_report(data: dict, db: Session = Depends(get_db),
                    user=Depends(require_roles("admin", "business_manager"))):
    raw_type = str(data.get("report_type") or "").strip().lower()
    report_type = REPORT_TYPE_ALIASES.get(raw_type, raw_type)
    if report_type not in REPORT_TYPES:
        raise HTTPException(400, f"report_type must be one of {sorted(set(REPORT_TYPES) | set(REPORT_TYPE_ALIASES))}")

    period_start = parse_dt(data["period_start"]) if data.get("period_start") else None
    period_end = parse_dt(data["period_end"]) if data.get("period_end") else None
    # Date-only end values are inclusive: extend to the end of that day.
    if period_end and len(str(data["period_end"]).strip()) <= 10:
        period_end = period_end + timedelta(days=1)
    try:
        risk_threshold = float(data.get("risk_threshold", 75))
    except (TypeError, ValueError):
        raise HTTPException(400, "risk_threshold must be a number between 0 and 100")
    if not 0 <= risk_threshold <= 100:
        raise HTTPException(400, "risk_threshold must be between 0 and 100")

    payload = _build_report_payload(db, report_type, period_start, period_end, risk_threshold)
    report = Report(
        id=str(uuid4()),
        report_type=report_type,
        title=data.get("title") or report_type.replace("_", " ").title(),
        period_start=period_start,
        period_end=period_end,
        payload=json.dumps(payload, default=str),
        created_by=user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/reports/{report_id}/export")
def export_report(report_id: str, format: str = "json",
                  db: Session = Depends(get_db), user=Depends(get_current_user)):
    report = get_object(db, Report, report_id)
    if format == "csv":
        import csv as csv_module
        import io
        payload = json.loads(report.payload or "{}")
        out = io.StringIO()
        writer = csv_module.writer(out)
        writer.writerow(["key", "value"])
        for k, v in _flatten_payload(payload):
            writer.writerow([k, v])
        return {"filename": f"{report.report_type}.csv", "content": out.getvalue()}
    return {"filename": f"{report.report_type}.json", "content": report.payload}


# ---------- Audit logs ----------
@router.get("/audit-logs", response_model=dict)
def list_audit_logs(db: Session = Depends(get_db),
                    user=Depends(require_roles("admin")),
                    page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200)):
    result = get_list(db, AuditLog, page=page, page_size=page_size)
    result["items"] = [AuditLogOut.model_validate(a).model_dump() for a in result["items"]]
    return result
