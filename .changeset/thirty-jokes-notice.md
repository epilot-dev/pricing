---
'@epilot/pricing': patch
---

Updated the processOrderTableData function to ensure that the line item unit_amount_net remains a raw numeric value, while the formatted value is still accessible under price.unit_amount_net.
