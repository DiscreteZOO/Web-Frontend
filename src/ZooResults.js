import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import ReactTable from "react-table";
import objectProperties from './objectProperties.json';

function camelCase(s) { return s.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); }); }

const defaultColumns = {
    graphs: ["order", "vt", "cvt", "symcubic", "diameter", "girth", 
             "is_arc_transitive", "is_bipartite", "is_cayley", "is_hamiltonian"],
    maniplexes: []
}

class ZooResults extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            columns: defaultColumns
        };
        this.getColumns = (objects) => {
            const colNames = this.state.columns[this.props.objects]
            const colObjects = colNames.map((columnName) => {
                var c = objectProperties[objects][columnName];
                var obj = {
                    Header: c.display,
                    accessor: columnName
                };
                return obj;  
            })
            return colObjects;
        }
    }
    
    render() {
        function flattenData(row) {
            var obj = { zooid: row.zooid };
            Object.keys(row.index).forEach(function(key) { obj[key] = row.index[key]; });
            Object.keys(row.bool).forEach(function(key) { obj[key] = row.bool[key]; });
            Object.keys(row.numeric).forEach(function(key) { obj[key] = row.numeric[key]; });
            return obj;
        }
        const columns = this.getColumns(this.props.objects);
        const data = this.props.results.map(flattenData);
        return (
            <section id="results">
				<Container>
					<Row>
                        <Col lg="12">
                            <div className="table-responsive">
                                <ReactTable
                                    data={data} 
                                    columns={columns} />
                            </div>
					   </Col>
				    </Row>
                </Container>
            </section>
        );
    }
}



export default ZooResults;