from flask import Flask, request, send_from_directory, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from random import random
from os import remove, system

import main

app = Flask(__name__)
limiter = Limiter(get_remote_address, app=app)

@app.route("/")
def home():
  return render_template("index.html")

@app.route("/upload", methods=["POST"])
@limiter.limit("1/minute")
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
  except:
    return {"error": "something went wrong"}, 500
  remove(url)
  system("rm -rf out/*")

  return send_from_directory("", url + ".mp4")

if __name__ == "__main__":
  app.run()
