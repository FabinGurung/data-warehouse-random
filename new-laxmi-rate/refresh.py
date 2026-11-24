"""Validate/refresh the public DEMO snapshot only. Never publish private records."""
import csv, io, json, math, os, pathlib, sys
from urllib.parse import urlparse
ROOT=pathlib.Path(__file__).resolve().parent
TARGET=ROOT/"catalogue.json"
HEAD=["Article","Name","Category","Subcategory","Wholesale","Retail","ImageUrl"]
def parse_rows(rows):
    if not rows or rows[0]!=HEAD: raise ValueError("Expected exact products headers: "+", ".join(HEAD))
    products=[]; seen=set()
    for row in rows[1:]:
        if not any(str(x).strip() for x in row): continue
        if len(row)>7: raise ValueError("Unexpected extra columns")
        row=list(row)+[""]*(7-len(row))
        p=dict(zip(HEAD,row))
        for key in HEAD:
            if key not in ("Wholesale","Retail"): p[key]=str(p[key]).strip()
        if not p["Article"].startswith("DEMO-") or p["Article"] in seen: raise ValueError("Only unique DEMO- article IDs are permitted")
        if not all(p[k] for k in ["Name","Category","Subcategory"]): raise ValueError("Missing product fields")
        for k in ("Wholesale","Retail"):
            v=float(str(p[k]).replace(",",""))
            if not math.isfinite(v) or v<0: raise ValueError("Invalid price")
            p[k]=v
        if p["ImageUrl"]:
            u=urlparse(p["ImageUrl"])
            if u.scheme!="https" or not u.hostname or u.username or u.password: raise ValueError("Use approved HTTPS image URLs only")
        seen.add(p["Article"]);products.append(p)
    if len(products)>10000: raise ValueError("Unexpected product count")
    return products
def categories(rows,products):
    if rows and rows[0]!=["name","subcategories"]: raise ValueError("Wrong category headers")
    out={}
    for row in rows[1:]:
        if not row or not str(row[0]).strip(): continue
        out.setdefault(str(row[0]).strip(),set()).update(x.strip() for x in str(row[1] if len(row)>1 else "").split(",") if x.strip())
    for p in products: out.setdefault(p["Category"],set()).add(p["Subcategory"])
    return [{"name":k,"subcategories":sorted(v)} for k,v in sorted(out.items())]
def main():
    source=os.getenv("PRODUCTS_CSV","").strip()
    cat_csv=os.getenv("CATEGORIES_CSV","").strip()
    credentials=os.getenv("LAXMI_SHEETS_CREDENTIALS","").strip()
    sid=os.getenv("LAXMI_SHEET_ID","").strip()
    if source:
        rows=list(csv.reader(io.StringIO(source))); cats=list(csv.reader(io.StringIO(cat_csv))) if cat_csv else []
    elif credentials and sid:
        from google.oauth2.service_account import Credentials
        from google.auth.transport.requests import AuthorizedSession
        from urllib.parse import quote
        session=AuthorizedSession(Credentials.from_service_account_info(json.loads(credentials),scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]))
        def read(rng):
            response=session.get("https://sheets.googleapis.com/v4/spreadsheets/"+quote(sid,safe="")+"/values/"+quote(rng,safe=""),params={"valueRenderOption":"UNFORMATTED_VALUE"},timeout=30)
            response.raise_for_status()
            return response.json().get("values",[])
        rows=read("products!A1:G10001"); cats=read("categories!A1:B10001")
    else:
        saved=json.loads(TARGET.read_text())
        if saved.get("mode")!="DEMO": raise ValueError("Not a demo snapshot")
        rows=[HEAD]+[[p.get(k,"") for k in HEAD] for p in saved["products"]]
        cats=[["name","subcategories"]]+[[c["name"],",".join(c["subcategories"])] for c in saved["categories"]]
        products=parse_rows(rows)
        categories(cats,products)
        print("Existing demo snapshot validated:",len(products),"products")
        return
    products=parse_rows(rows)
    output={"mode":"DEMO","products":products,"categories":categories(cats,products)}
    TARGET.write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n")
    print("Validated demo products:",len(products))
if __name__=="__main__": main()
