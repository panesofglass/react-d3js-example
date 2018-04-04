import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';
import * as topojson from 'topojson';

import { USStateName } from '../../DataHandling';
import County from './County';

interface Props {
    usTopoJson: topojson.UsAtlas | null;
    USstateNames: USStateName[];
    values: {countyID: number; value: number }[];
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number | null;
}

class CountyMap extends React.Component<Props, {}> {
    projection: d3.GeoProjection;
    geoPath: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    quantize: d3.ScaleQuantize<number>;

    constructor(props: Props) {
        super(props);

        this.projection = d3.geoAlbersUsa().scale(1280);
        this.geoPath = d3.geoPath().projection(this.projection);
        this.quantize = d3.scaleQuantize().range(d3.range(9));
        this.updateD3(props);
    }

    componentWillReceiveProps(nextProps: Props) {
        this.updateD3(nextProps);
    }

    updateD3(props: Props) {
        this.projection
            .translate([props.width / 2, props.height / 2])
            .scale(props.width * 1.3);

        if (props.zoom && props.usTopoJson) {
            const us = props.usTopoJson,
                  statePaths = topojson.feature(us, us.objects.states).features,
                  USstateName = _.find(props.USstateNames, {code: props.zoom});

            if (USstateName !== undefined) {
                const id = USstateName.id,
                      statePath = _.find(statePaths, {id: id});

                if (statePath !== undefined) {
                    this.projection.scale(props.width * 4.5);
                    const centroid = this.geoPath.centroid(statePath),
                          translate = this.projection.translate();

                    this.projection.translate([
                        translate[0] - centroid[0] + props.width / 2,
                        translate[1] - centroid[1] + props.height / 2
                    ]);
                }
            }
        }

        if (props.values) {
            this.quantize.domain([
                d3.quantile(props.values, 0.15, d => d.value) || 0,
                d3.quantile(props.values, 0.85, d => d.value) || 0
            ]);
        }
    }

    render() {
        if (!this.props.usTopoJson) {
            return null;
        } else {
            const us = this.props.usTopoJson,
                  statesMesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b),
                  counties = topojson.feature(us, us.objects.counties).features;

            const countyValueMap: _.Dictionary<number> =
                _.fromPairs(this.props.values.map(d => [d.countyID, d.value]));

            return (
                <g transform={`translate(${this.props.x}, ${this.props.y})`}>
                    {counties.map((feature) => (
                        <County
                            geoPath={this.geoPath}
                            feature={feature}
                            zoom={this.props.zoom}
                            key={feature.id}
                            quantize={this.quantize}
                            value={countyValueMap[feature.id || 0]}
                        />
                    ))}
                    <path
                        d={this.geoPath(statesMesh) || ''}
                        style={{fill: 'none', stroke: '#fff', strokeLinejoin: 'round'}}
                    />
                </g>
            );
        }
    }
}

export default CountyMap;