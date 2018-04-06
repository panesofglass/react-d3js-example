import * as React from 'react';
import * as d3 from 'd3';
import { Salary } from '../DataHandling';

interface Props {
    data: Salary[];
    x: number;
    y: number;
    width: number;
    height: number;
    bottomMargin: number;
    median: number;
    value: (x: Salary | any) => number;
}

class MedianLine extends React.Component<Props, {}> {
    yScale: d3.ScaleLinear<number, number>;

    constructor(props: Props) {
        super(props);
    }

    componentWillMount() {
        this.yScale = d3.scaleLinear();

        this.updateD3(this.props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.updateD3(nextProps);
    }

    updateD3(props: Props) {
        this.yScale
            .domain([0, d3.max(props.data, props.value) as number])
            .range([0, props.height - props.y - props.bottomMargin]);
    }

    render() {
        const median = this.props.median || d3.median(this.props.data, this.props.value) as number,
              line = d3.line()([[0, 5], [this.props.width, 5]]) as string,
              tickFormat = this.yScale.tickFormat();

        const translate = `translate(${this.props.x}, ${this.yScale(median)})`,
              medianLabel = `Median Household: $${tickFormat(median)}`;

        return (
            <g className="mean" transform={translate}>
                <text x={this.props.width - 5} y={0} textAnchor="end">
                    {medianLabel}
                </text>
                <path d={line} />
            </g>
        );
    }
}

export default MedianLine;