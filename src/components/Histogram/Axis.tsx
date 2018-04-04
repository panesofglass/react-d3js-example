import * as d3 from 'd3';
import D3blackbox, { D3blackboxProps } from '../D3blackbox';

export interface AxisProps extends D3blackboxProps {
    scale: d3.AxisScale<any>;
    data: any[];
}

const Axis = D3blackbox((anchor, props: AxisProps) => {
    const axis = d3.axisLeft(props.scale)
                   .tickFormat(d => `${d3.format('.2s')(d)}`)
                   .ticks(props.data.length);

    d3.select(anchor)
      .call(axis);
});

export default Axis;