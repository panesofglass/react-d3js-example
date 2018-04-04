import * as React from 'react';
import * as d3 from 'd3';
import { Salary } from '../../DataHandling';
import HistogramBar from './HistogramBar';
import Axis from './Axis';

interface Props {
    bins: number;
    width: number;
    height: number;
    x: number;
    y: number;
    data: Salary[];
    axisMargin: number;
    bottomMargin: number;
    value: (d: Salary | any) => number;
}

interface State {

}

class Histogram extends React.Component<Props, State> {
    histogram: d3.HistogramGenerator<Salary, number>;
    widthScale: d3.ScaleLinear<number, number>;
    yScale: d3.ScaleLinear<number, number>;

    constructor(props: Props) {
        super(props);

        this.histogram = d3.histogram<Salary, number>();
        this.widthScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();

        this.updateD3(props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.updateD3(nextProps);
    }

    updateD3(props: Props) {
        this.histogram
            .thresholds(props.bins)
            .value(props.value);

        const bars = this.histogram(props.data),
              counts = bars.map((d) => d.length);

        this.widthScale
            .domain([d3.min(counts) || 0, d3.max(counts) || 0])
            .range([0, props.width - props.axisMargin]);
        
        this.yScale
            .domain([0, d3.max(bars, (d) => d.x1) || 0])
            .range([0, props.height - props.y - props.bottomMargin]);
    }

    makeBar = (bar: d3.Bin<Salary, number>) => {
        let percent = bar.length / this.props.data.length * 100;
        return (
            <HistogramBar
                key={'histogram-bar-' + bar.x0}
                percent={percent}
                x={this.props.axisMargin}
                y={this.yScale(bar.x0)}
                width={this.widthScale(bar.length)}
                height={this.yScale(bar.x1 - bar.x0)}
            />
        );
    }

    render() {
        const translate = `translate(${this.props.x}, ${this.props.y})`,
              bars = this.histogram(this.props.data);

        return (
            <g className="histogram" transform={translate}>
                <g className="bars">
                    {bars.map(this.makeBar)}
                </g>
                <Axis
                    x={this.props.axisMargin - 3}
                    y={0}
                    data={bars}
                    scale={this.yScale}
                />
            </g>
        );
    }
}

export default Histogram;