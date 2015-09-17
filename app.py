from flask import Flask
from flask import render_template
from data import get_dates, process_timeline, process_treemap

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/timeline")
def timeline():
	dates = get_dates('static/dlad_portfolio.json')
	data = process_timeline('static/dlad_portfolio.json')
	return render_template("timeline.html", data=data, dates=dates)

@app.route("/treemap")
def treemap():
	data = process_treemap('static/dlad_portfolio.json')
	return render_template("treemap.html", data=data)

if __name__ == "__main__":
    app.run(debug=True)
