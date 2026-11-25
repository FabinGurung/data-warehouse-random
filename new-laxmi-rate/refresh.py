"""Validate the seven-column approved public catalogue; unknown amounts remain null."""
import csv, io, json, math, os, pathlib, re
from urllib.parse import urlparse
ROOT=pathlib.Path(__file__).resolve().parent
TARGET=ROOT/"catalogue.json"
HEAD=["Item Name","EXIM Code","Description","Rate","Wholesale Value","Retail Value","Photo"]
AMOUNTS=HEAD[3:6]
def parse_rows(rows):
    if not rows or rows[0]!=HEAD: raise ValueError("Expected exact products headers: "+", ".join(HEAD))
    products=[]
    for row in rows[1:]:
        if not any(x is not None and str(x).strip() for x in row): continue
        if len(row)>7: raise ValueError("Unexpected extra columns")
        row=list(row)+[""]*(7-len(row))
        p=dict(zip(HEAD,row))
        for key in HEAD:
            if key not in AMOUNTS: p[key]="" if p[key] is None else str(p[key]).strip()
        if not p["Item Name"]: raise ValueError("Item Name is required")
        if re.fullmatch(r"DEMO-\d+",p["Item Name"],re.I): raise ValueError("Enter a meaningful item name")
        for k in AMOUNTS:
            value=p[k]
            if value is None or str(value).strip()=="": p[k]=None; continue
            if isinstance(value,bool): raise ValueError("Invalid amount")
            v=float(str(value).replace(",",""))
            if not math.isfinite(v) or v<0: raise ValueError("Invalid amount")
            p[k]=v
        photo=p["Photo"]
        if photo:
            if photo.startswith("photos/"):
                if not re.fullmatch(r"photos/[A-Za-z0-9_./-]+\.(png|jpe?g|webp|avif|gif)",photo,re.I) or ".." in photo.split("/") or not (ROOT/photo).is_file(): raise ValueError("Missing or invalid local photo")
            else:
                u=urlparse(photo)
                if u.scheme!="https" or not u.hostname or u.username or u.password: raise ValueError("Use approved public HTTPS image URLs")
        products.append(p)
    if len(products)>10000: raise ValueError("Unexpected item count")
    return products
def main():
    source=os.getenv("PRODUCTS_CSV","").strip().lstrip("\ufeff")
    credentials=os.getenv("LAXMI_SHEETS_CREDENTIALS","").strip()
    sid=os.getenv("LAXMI_SHEET_ID","").strip()
    mode=os.getenv("CATALOGUE_MODE","SAMPLE")
    require_source=os.getenv("REQUIRE_SOURCE","").lower()=="true"
    if mode not in ("SAMPLE","APPROVED"): raise ValueError("Invalid publication mode")
    if source:
        rows=list(csv.reader(io.StringIO(source)))
    elif credentials and sid:
        from google.oauth2.service_account import Credentials
        from google.auth.transport.requests import AuthorizedSession
        from urllib.parse import quote
        session=AuthorizedSession(Credentials.from_service_account_info(json.loads(credentials),scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]))
        response=session.get("https://sheets.googleapis.com/v4/spreadsheets/"+quote(sid,safe="")+"/values/"+quote("products!A1:G10001",safe=""),params={"valueRenderOption":"UNFORMATTED_VALUE"},timeout=30)
        response.raise_for_status()
        rows=response.json().get("values",[])
    else:
        if require_source: raise ValueError("Publication needs Sheet CSV or configured authorized read-only credentials")
        saved=json.loads(TARGET.read_text())
        if saved.get("mode") not in ("SAMPLE","APPROVED"): raise ValueError("Invalid saved catalogue mode")
        if any(set(p)!=set(HEAD) for p in saved["products"]): raise ValueError("Unexpected saved catalogue fields")
        rows=[HEAD]+[[p[k] for k in HEAD] for p in saved["products"]]
        parse_rows(rows)
        print("Existing catalogue validated:",len(saved["products"]),"items")
        return
    products=parse_rows(rows)
    TARGET.write_text(json.dumps({"mode":mode,"products":products},ensure_ascii=False,indent=2)+"\n")
    print("Validated catalogue:",len(products),"items")
if __name__=="__main__": main()
