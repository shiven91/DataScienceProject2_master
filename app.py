import pandas as pd
import numpy as np
import os
import pymongo
import json
import flask
import glob
import geojson
from geojson import Feature, FeatureCollection, Point
from flask import Flask, render_template
from flask import jsonify
from flask import request
from flask_pymongo import PyMongo
from sensitive import uri
from bson import json_util
from bson.json_util import dumps


app = Flask(__name__)
app.config['MONGO_DBNAME'] = 'earthquake'
app.config['MONGO_URI'] = uri
mongo = PyMongo(app)
client = pymongo.MongoClient(uri)
mng_db = client.earthquake
collection = mng_db["all_records"]

def create_df():
    path = os.path.join("data")
    big_frame = pd.concat([pd.read_csv(f) for f in glob.glob(path + "/*.csv")],ignore_index=True)
    big_frame['time'] = pd.to_datetime(big_frame['time'])
    big_frame['Date'] = big_frame['time'].dt.strptime('%Y-%m-%d')
    big_frame['Time'] = big_frame['time'].dt.strftime('%H:%M:%S')
    combined_df = big_frame[["Date","Time","latitude","longitude","mag","type","place"]].copy()
    data = json.loads(combined_df.to_json(orient="records"))
    collection.drop()
    collection.insert(data)

@app.route('/')
def main():
    all_data = mongo.db.all_records.limit(100)
    output = []
    for s in all_data.find({},{"_id":False}).limit(100):
        output.dumps(s)
    return FeatureCollection(all_data)

@app.route("/earthquakedata")
def earthquakedata():
    connection = pymongo.MongoClient(uri)
    collection = connection["earthquake"]["all_records"]
    projects = collection.find({},{"_id":False}).limit(100)
    json_projects = []
    data = {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",

            "properties" : {"mag":[d["mag"]], "place":[d["place"]]},

            "geometry" : {
                "type": "Point",
                "coordinates": [d["longitude"], d["latitude"]],
                },
        } for d in projects]
    }
    json_projects.append(data)
    return jsonify(data)



@app.route('/updateMongoDB')
def updateMongoDB():
    create_df()

@app.route("/heatmap")
def heatmap():
    return render_template('heatmap_2.html')

if __name__ == "__main__":
    app.run()



