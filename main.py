import pandas as pd

data = {
    "ean": ["4069943929430","4069943929423", "4069943929416"],
    "price": [200, 300, 400]
        }

df = pd.DataFrame(data);
df.to_csv("example.csv")