import pandas as pd, requests, json
import os
import glob

path = os.path.join("data")
big_frame = pd.concat([pd.read_csv(f) for f in glob.glob(path + "/*.csv")],ignore_index=True)
combined_df = big_frame[["latitude","longitude","mag"]].copy()

combined_df['latitude'] = combined_df['latitude'].astype(float)
combined_df['longitude'] = combined_df['longitude'].astype(float)
useful_cols= ['latitude','longitude','mag']

def df_to_geojson(combined_df, properties, lat='latitude', lon='longitude'):
    geojson = {'type':'FeatureCollection', 'features':[]}
    for _, row in combined_df.iterrows():
        # create a feature template to fill in
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}

        # fill in the coordinates
        feature['geometry']['coordinates'] = [row[lon],row[lat]]

        # for each column, get the value and add it as a new feature property
        for prop in properties:
            feature['properties'][prop] = row[prop]
        
        # add this feature (aka, converted dataframe row) to the list of features inside our dict
        geojson['features'].append(feature)
    
    return geojson

geojson_dict = df_to_geojson(combined_df, properties=useful_cols)
geojson_str = json.dumps(geojson_dict, indent=2)

output_filename = 'earthquake.js'
with open(output_filename, 'w') as output_file:
    output_file.write('var dataset = {};'.format(geojson_str))
