import unittest
from refresh import parse_rows,HEAD
class CatalogueTests(unittest.TestCase):
    def test_blank_and_code(self):
        p=parse_rows([HEAD,["Shirt","00123","Cotton",850,1200,""]])[0]
        self.assertEqual(p["EXIM Code"],"00123")
        self.assertEqual(set(p),set(HEAD))
        self.assertEqual(p["Retail Value"],1200)
        self.assertIsNone(parse_rows([HEAD,["Shirt"]])[0]["Wholesale Value"])
        self.assertEqual(p["Wholesale Value"],850)
    def test_duplicate_names(self):
        self.assertEqual(len(parse_rows([HEAD,["Shirt"],["Shirt"]])),2)
    def test_empty_sheet(self):
        self.assertEqual(parse_rows([HEAD]),[])
    def test_negative(self):
        with self.assertRaises(ValueError): parse_rows([HEAD,["Shirt","","",-1]])
    def test_legacy_schema(self):
        with self.assertRaises(ValueError): parse_rows([["Article","Name"],["DEMO-001","Shirt"]])
    def test_removed_rate_schema(self):
        with self.assertRaises(ValueError): parse_rows([["Item Name","EXIM Code","Description","Rate","Wholesale Value","Retail Value","Photo"]])
    def test_photo_traversal(self):
        with self.assertRaises(ValueError): parse_rows([HEAD,["Shirt","","","","","photos/../test.png"]])
if __name__=="__main__": unittest.main()
