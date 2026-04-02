from flask import Flask, request, send_from_directory, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from random import random
from os import remove, system

import traceback
import json

import main

app = Flask(__name__)
limiter = Limiter(get_remote_address, app=app)

def increment(stat):
  data = {}
  with open("stats/stats.json", 'r') as f:
    data = json.load(f)

  if stat in data:
    data[stat] = data[stat] + 1
  else:
    data[stat] = 0

  with open("stats/stats.json", 'w') as f:
    json.dump(data, f)

  return data[stat]


@app.route("/stats")
def stats():
  data = {}
  try:
    with open("stats/stats.json", 'r') as f:
      data = json.load(f)
  except:
    ...
  
  if "hits" not in data:
    data["hits"] = 0
  if "renders" not in data:
    data["renders"] = 0
  if "errors" not in data:
    data["errors"] = 0

  return data, 200

@app.route("/")
def home():
  increment("hits")
  
  return render_template("index.html")

@app.route("/upload", methods=["POST"])
@limiter.limit("6/minute")
def upload():
  try:
    system("rm *.mp4") # remove past runs
  except:
    ...

  file = request.files["file"]
  
  url = str(random())[2:] + ".ry" 

  with open(url, 'wb') as f:
    f.write(file.read())

  try:
    main.load_and_run(url)
  except Exception as e:
    increment("errors")
    stre = traceback.format_exc()
    with open(url + ".err", 'w') as f:
      data = {"error" : stre}
      json.dump(data, f)
    return {"error": "something went wrong", "details": str(e)}, 500
  remove(url)

  increment("renders")

  return send_from_directory("", url + ".mp4")

if __name__ == "__main__":
  app.run()
