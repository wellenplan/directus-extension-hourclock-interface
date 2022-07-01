import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels)

export default defineInterface({
	id: 'hour-clocks-interface',
	name: '$:hour-clocks.interface.name',
	description: '$:hour-clocks.interface.description',
	icon: 'box',
	component: InterfaceComponent,
	options: ({ relations }) => {
		const collection = relations.o2m?.collection;

		return [
			{
				field: 'resolution',
				name: '$:hour-clocks.interface.options.resolution',
				type: 'integer',
				meta: {
					interface: 'input',
				},
				schema: {
					default_value: '60',
				},
			},
			{
				field: 'template',
				name: '$t:display_template',
				meta: {
					interface: 'system-display-template',
					options: {
						collectionName: collection,
					},
					width: 'full',
				},
			},
			{
				field: 'enableCreate',
				name: '$t:creating_items',
				schema: {
					default_value: true,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:enable_create_button',
					},
					width: 'half',
				},
			},
			{
				field: 'enableSelect',
				name: '$t:selecting_items',
				schema: {
					default_value: true,
				},
				meta: {
					interface: 'boolean',
					options: {
						label: '$t:enable_select_button',
					},
					width: 'half',
				},
			},
			{
				field: 'filter',
				name: '$t:filter',
				type: 'json',
				meta: {

					interface: 'system-filter',
					options: {
						collectionName: collection,
					},
					conditions: [
						{
							rule: {
								enableSelect: {
									_eq: false,
								},
							},
							hidden: true,
						},
					],
				},
			},
		];
	},
	// TODO: remove types that we don't support
	types: ['alias', 'string', 'uuid', 'integer', 'bigInteger', 'json'],
	localTypes: ['o2m'],
});
