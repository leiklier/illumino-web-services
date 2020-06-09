import React from 'react'
import classNames from 'classnames'
import styles from './Logo.css'

function Logo({ className, color }) {
	return (
		<div
			className={classNames({
				[styles.container]: true,
				[className]: className,
			})}
			style={{ color }}
		>
			<svg
				id="svg"
				xmlns="http://www.w3.org/2000/svg"
				width="60"
				height="60"
				viewBox="0, 0, 400,335.58052434456926"
			>
				<g id="svgg">
					<path
						id="path0"
						d="M186.891 10.239 C 135.130 13.432,75.725 33.684,37.266 61.249 C 30.361 66.197,30.533 65.114,35.635 71.536 C 42.094 79.664,40.968 79.367,47.668 74.711 C 106.069 34.132,187.531 17.745,256.799 32.643 C 284.619 38.627,312.687 49.990,340.183 66.402 C 344.568 69.019,348.368 71.161,348.627 71.161 C 348.997 71.161,354.825 62.515,357.533 57.947 C 358.072 57.038,345.103 49.107,331.086 41.773 C 286.699 18.547,235.106 7.264,186.891 10.239 M185.393 48.005 C 141.269 51.562,92.766 68.161,61.626 90.360 L 56.960 93.687 61.927 100.027 C 67.817 107.546,66.625 107.334,74.262 102.222 C 145.881 54.284,246.807 52.224,326.707 97.068 C 330.822 99.378,334.383 101.073,334.621 100.835 C 335.258 100.198,343.039 86.605,342.854 86.451 C 341.739 85.526,322.644 75.714,316.105 72.707 C 273.668 53.192,228.028 44.567,185.393 48.005 M186.891 85.762 C 186.067 85.908,181.348 86.423,176.404 86.907 C 147.338 89.752,108.408 102.981,85.562 117.775 L 79.364 121.788 84.438 128.550 L 89.513 135.312 94.007 132.427 C 154.455 93.625,238.774 92.588,308.465 129.789 C 312.296 131.834,315.542 133.384,315.677 133.233 C 316.274 132.567,323.596 119.351,323.596 118.940 C 323.596 118.688,320.118 116.641,315.867 114.391 C 290.557 100.996,262.231 91.654,234.457 87.544 C 225.185 86.172,191.664 84.916,186.891 85.762 M308.960 152.996 C 308.764 153.511,308.690 192.865,308.796 240.449 L 308.989 326.966 351.148 327.160 L 393.308 327.353 393.096 318.920 L 392.884 310.487 359.363 310.292 L 325.843 310.097 325.843 239.812 L 325.843 169.527 342.818 169.033 C 352.154 168.762,367.154 168.539,376.151 168.539 L 392.509 168.539 392.509 160.300 L 392.509 152.060 350.913 152.060 C 318.325 152.060,309.239 152.263,308.960 152.996 M8.801 153.238 C 8.493 153.552,8.240 157.456,8.240 161.915 L 8.240 170.022 41.760 170.217 L 75.281 170.412 75.472 241.011 L 75.663 311.610 42.326 311.610 L 8.989 311.610 8.989 320.347 L 8.989 329.084 50.261 328.585 C 72.961 328.311,91.838 327.899,92.209 327.670 C 93.026 327.165,93.138 154.544,92.322 154.068 C 91.299 153.472,9.374 152.658,8.801 153.238 M112.360 240.449 L 112.360 328.090 200.000 328.090 L 287.640 328.090 287.640 240.449 L 287.640 152.809 200.000 152.809 L 112.360 152.809 112.360 240.449 M270.412 240.824 L 270.412 311.610 200.000 311.610 L 129.588 311.610 129.588 240.824 L 129.588 170.037 200.000 170.037 L 270.412 170.037 270.412 240.824 M190.780 199.626 C 159.774 208.150,149.859 248.068,173.009 271.176 C 203.792 301.905,254.037 269.029,240.089 227.284 C 233.025 206.145,211.332 193.976,190.780 199.626 "
						stroke="none"
						fill={color}
						fillRule="evenodd"
					></path>
				</g>
			</svg>
			<span className={styles.text}>Illumino™</span>
		</div>
	)
}

export default Logo
