import glob
import pandas as pd

files = glob.glob("./files/CSV/Male/Masum/*.csv")

### CSV column names
# for file in files:
#     df = pd.read_csv(file)
#     df = df.dropna()
#     df = df.reset_index(drop=True)
#     df.columns = ["FaceBlendShape." + str(col) for col in df.columns]
#     df.to_csv(file, index=False)

#### Fixing neck
# df = pd.read_csv(files[3])
# df['FaceBlendShape.HeadPitch'] = df['FaceBlendShape.HeadPitch'].apply(lambda x: x + 0.2)
# df.to_csv(files[3], index=False)
