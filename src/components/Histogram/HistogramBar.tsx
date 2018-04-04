import * as React from 'react';

interface Props {
    percent: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const HistogramBar: React.SFC<Props> = ({ percent, x, y, width, height }) => {
    let translate = `translate(${x}, ${y})`,
        label = percent.toFixed(0) + '%';
    
    if (percent < 1) {
        label = percent.toFixed(2) + '%';
    }

    if (width < 20) {
        label = label.replace('%', '');
    }

    if (width < 10) {
        label = '';
    }

    return (
        <g transform={translate} className="bar">
            <rect
                width={width}
                height={height - 2}
                transform="transform(0, 1)"
            />
            <text textAnchor="end" x={width - 5} y={height / 2 + 3}>
                {label}
            </text>
        </g>
    );
};

export default HistogramBar;