import * as React from 'react';

export interface D3blackboxProps {
    x: number;
    y: number;
}

export default function D3blackbox<T extends D3blackboxProps>(D3render: (anchor: SVGGElement | null, props: T) => void) {
    return class Blackbox extends React.Component<T, any> {
        anchor: SVGGElement | null;
        componentDidMount() {
            D3render(this.anchor, this.props);
        }
        componentDidUpdate() {
            D3render(this.anchor, this.props);
        }
        render() {
            const { x, y } = this.props;
            return <g transform={`translate(${x}, ${y})`} ref={el => this.anchor = el} />;
        }
    };
}