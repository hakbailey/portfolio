from flask import Flask
from flask import render_template
from data import get_dates, process_timeline, process_treemap, write_to_json

app = Flask(__name__)

@app.route("/timeline")
def timeline():
	dates = get_dates('static/dms_portfolio.json')
	time_data = process_timeline('static/dms_portfolio.json')
	write_to_json('static/data_time.json', time_data)
	return render_template("timeline.html", data=time_data, dates=dates)

@app.route("/")
@app.route("/treemap")
def treemap():
	tree_data = process_treemap('static/dms_portfolio.json')
	write_to_json('static/data_tree.json', tree_data)
	return render_template("treemap.html", data=tree_data)

if __name__ == "__main__":
    app.run(debug=True)
