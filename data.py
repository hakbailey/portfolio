import json
from pprint import pprint

def process_data(data_file):
	with open(data_file, 'rb') as input_data:
		data = json.load(input_data)
		sponsors = []
		multi_sponsors = []
		new_data = {'name': data['name'], 'children': []}

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

		for i in range(len(data['projects']) - 1, -1, -1):

			for s in multi_sponsors:
				if data['projects'][i]['sponsor'] == s:
					k = find(new_data['children'], 'name', s)
					new_data['children'][k]['children'].append(data['projects'].pop(i))
			try:
				new_data['children'].append(data['projects'].pop(i))
			except:
				continue

		return new_data

def find(array, key, value):
    for i, d in enumerate(array):
        if d[key] == value:
        	return i
    raise ValueError

def write_to_json(output_file, data):
	with open(output_file, 'wb') as write_file:
		json.dump(data, write_file, indent=4)

if __name__ == '__main__':
	data = process_data('static/dlad_portfolio.json')
	write_to_json('static/data.json', data)