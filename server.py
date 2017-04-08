import flask
from two1.wallet import Wallet
from two1.bitserv.flask import Payment
import requests
from flask import request

app = flask.Flask(__name__)
wallet = Wallet()
payment = Payment(app, wallet)

# Use this to add 5000 to your Team Satoshi balance
# TODO: Make it work :)
@payment.required(5000)
@app.route('/addFunds')
def addFunds():
    teamId = request.args.get('teamId')
    print("Adding funds to team with id = " + teamId)

    r = requests.post("http://127.0.0.1:3000/api/teams/" + teamId + "/changeBalance", data={'amount': 5000})
    print(r.status_code, r.reason)

    return str(r.reason), r.status_code

@app.route('/payAddress')
def payAddress():
    address = request.args.get('address')
    amount = request.args.get('amount')

    print("Transfering " + amount + " to " + address)

    wallet.send_to(address, int(amount))

    return "", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)
