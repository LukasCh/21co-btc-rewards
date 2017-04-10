import flask
import time
import json
from two1.wallet import Wallet
from two1.bitserv.flask import Payment
from two1.commands.config import Config
from two1.bitserv.payment_methods import BitTransfer
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

@app.route('/payUser')
def payUser():
    payee = request.args.get('user')
    amount = int(request.args.get('amount'))
    payer = Config().username
    description = request.args.get('description', 'Reward from ' + payer)

    return "", sendBittransfer(payee, amount, description).raise_for_status()

#################### Pay to 21.co account
def sendBittransfer(payee_username, amount, description=""):
    """Create and redeem a BitTransfer."""
    wallet = Wallet()
    username = Config().username
    bittransfer, signature = createBittransfer(
        wallet, username, payee_username, amount, description)

    return redeemBittransfer(bittransfer, signature, payee_username)

def createBittransfer(wallet, payer_username, payee_username, amount, description=""):
    """Manually create and sign a BitTransfer.
    wallet is a Wallet instance, payer_username is Config().username.
    Refer to BitTransferRequests.make_402_payment.
    """

    bittransfer = json.dumps({
        'payer': payer_username,
        'payee_username': payee_username,
        'amount': amount,
        'timestamp': time.time(),
        'description': description
    })
    signature = wallet.sign_message(bittransfer)

    return bittransfer, signature

def redeemBittransfer(bittransfer, signature, payee_username):
    """Apply the result of create_bittransfer to effect the transfer.
    Refer to BitTransfer.redeem_payment.
    """
    verification_url = BitTransfer.verification_url.format(payee_username)

    return requests.post(verification_url,
                      data=json.dumps({'bittransfer': bittransfer,
                                       'signature': signature}),
                      headers={'content-type': 'application/json'})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)
