from flask import Flask
from flask import render_template
from data import process_data

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/timeline")
def timeline():
    return render_template("timeline.html")

@app.route("/treemap")
def treemap():
	data = process_data('static/dlad_portfolio.json')
	return render_template("treemap.html", data=data)

if __name__ == "__main__":
    app.run(debug=True)
