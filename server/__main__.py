from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import json

import atexit

app = Flask(__name__)
CORS(app)

# 0 = pre, 1 = on, 2 = late
voting = 0

try:
    with open("votes.json", "r") as file:
        ctn = json.loads(file.read())
        votes = ctn
except FileNotFoundError:
    votes = {
        'vote-lgt': {},
        'vote-lsb': {}
    }

@app.route('/set-vote', methods=['GET'])
def set_vote():
    global voting
    voting = int(request.args.get('a', 0))

    if voting == 0:
        return "Voting closed."
    elif voting == 1:
        return "Voting open."
    else:
        return "Voting ended."

@app.route('/vote', methods=['POST'])
def vote():
    if voting == 1:
        try:
            v = request.form.get('v')
            p = request.form.get('p')
        except:
            return "Incorrect parameters."
        else:
            orig = votes[v].get(p, 0)
            votes[v][p] = orig + 1
            return "Success."
    elif voting == 0:
        return abort(403) # Forbidden
    else:
        return abort(410) # Gone!

@app.route('/results')
def results():
    return jsonify(votes)

def save():
    with open("votes.json", "w+") as file:
        ctn = json.dumps(votes)
        file.write(ctn)

atexit.register(save)

app.run(port=3000)
