import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({cloud_name: 'bendmyers'});

export const homepageOpenGraphImageUrl = cloudinary.url(
	'bg_bggenerator_com_kub8ua',
	{
		transformation: [
			{
				effect: 'brightness:-25',
			},
			{
				color: '#ffffff',
				overlay: {
					font_family: 'Sacramento',
					font_size: 450,
					text: 'infusion'
				},
				crop: 'fit',
			},
			{
				gravity: 'center',
				y: 20,
				effect: 'shadow:20',
				color: '#00897e',
				flags: 'layer_apply'
			}
		]
	},
);

export function getOpenGraphImageUrl(title: string) {
	return cloudinary.url(
		'bg_bggenerator_com_kub8ua',
		{
			transformation: [
				{
					effect: 'brightness:-25',
				},
				{
					color: '#ffffff',
					overlay: {
						font_family: 'Lato',
						font_size: 210,
						font_weight: '900',
						text: title
					},
					width: 1780,
					height: 1200,
					crop: 'fit',
				},
				{
					gravity: 'west',
					x: 90,
					y: -40,
					effect: 'shadow:20',
					color: '#00897e',
					flags: 'layer_apply'
				},
				{
					color: '#ffffff',
					overlay: {
						font_family: 'Sacramento',
						font_size: 130,
						text: 'infusion'
					},
					width: 1200,
					height: 1200,
					crop: 'fit',
					gravity: 'south_west',
					x: 120,
					y: 60
				}
			]
		},
	);
}