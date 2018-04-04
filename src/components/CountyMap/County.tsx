import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';
import * as GeoJSON from 'geojson';

const ChoroplethColors = _.reverse([
    'rgb(247,251,255)',
    'rgb(222,235,247)',
    'rgb(198,219,239)',
    'rgb(158,202,225)',
    'rgb(107,174,214)',
    'rgb(66,146,198)',
    'rgb(33,113,181)',
    'rgb(8,81,156)',
    'rgb(8,48,107)'
]);

const BlankColor = 'rgb(240, 240, 240)';

interface Props {
    feature: GeoJSON.Feature<GeoJSON.GeometryObject, {}>;
    geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    quantize: d3.ScaleQuantize<number>;
    value: number;
    zoom: number | null;
}

class County extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    shouldComponentUpdate(nextProps: Props, nextState: {}) {
        const { zoom, value } = this.props;

        return zoom !== nextProps.zoom || value !== nextProps.value;
    }

    render() {
        const { value, geoPath, feature, quantize } = this.props;
        let color = BlankColor;
        if (value) {
            color = ChoroplethColors[quantize(value)];
        }

        return (
            <path d={geoPath(feature) || ''} style={{fill: color}} />
        );
    }
}

export default County;