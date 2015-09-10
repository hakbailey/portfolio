import json
from pprint import pprint

def process_data(data_file):
	with open(data_file, 'rb') as input_data:
		data = json.load(input_data)
		data['children'] = data.pop('projects')
		return data

def write_to_json(output_file, data):
	with open(output_file, 'wb') as write_file:
		json.dump(data, write_file, indent=4)

if __name__ == '__main__':
	data = process_data('static/dlad_portfolio.json')
	write_to_json('static/data.json', data)