import pandas as pd, numpy as np, matplotlib.pyplot as plt
df = pd.read_csv('../datasets/crimes.csv')
df = df.loc[df['YEAR'] == 2019]

print(df.shape)
df.to_csv('../datasets/filtered-crimes.csv')