import datetime
import json
from operator import itemgetter
from pprint import pprint

def process_treemap(data_file):
	with open(data_file, 'rb') as input_data:
		data = json.load(input_data)
		sponsors = []
		multi_sponsors = []
		new_data = {'name': data['name'], 'updated': data['updated'], 'children': []}

		projects = sorted(data['projects'], key=itemgetter('start'))
		data['projects'] = projects

		for item in data['projects']:
			s = item['sponsor']
			if s in sponsors:
				if s not in multi_sponsors:
					multi_sponsors.append(s)
			else:
				sponsors.append(s)

		for s in multi_sponsors:
			new_data['children'].append({
				'name': s,
				'children': []
				})

		for s in multi_sponsors:
			for i in range(len(data['projects']) - 1, -1, -1):
				if data['projects'][i]['sponsor'] == s:
					k = find(new_data['children'], 'name', s)
					new_data['children'][k]['children'].append(data['projects'].pop(i))
					
		for i in range(len(data['projects']) - 1, -1, -1):
			try:
				new_data['children'].append(data['projects'].pop(i))
			except:
				continue

		return new_data

def process_timeline(data_file):
	with open(data_file, 'rb') as input_data:
		data = json.load(input_data)
		projects = sorted(data['projects'], key=itemgetter('start'))
		data['projects'] = projects
	return data

def get_dates(data_file):
	with open(data_file, 'rb') as input_data:
		data = json.load(input_data)
		RESULTS = []
		for item in data['projects']:
			RESULTS.append(item['start'])
			RESULTS.append(item['target'])
		return sorted(RESULTS)

def find(array, key, value):
    for i, d in enumerate(array):
        if d[key] == value:
        	return i
    raise ValueError

def write_to_json(output_file, data):
	with open(output_file, 'wb') as write_file:
		json.dump(data, write_file, indent=4)

if __name__ == '__main__':
	tree_data = process_treemap('static/dlad_portfolio.json')
	write_to_json('static/data_tree.json', tree_data)
	time_data = process_timeline('static/dlad_portfolio.json')
	write_to_json('static/data_time.json', time_data)