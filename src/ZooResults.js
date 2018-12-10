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
        
        this.getColumns = (colNames = []) => {
            const list = (colNames.length == 0 ? defaultColumns[this.props.objects] : colNames);
            const colObjects = list.map((columnName) => {
                var c = objectProperties[this.props.objects][columnName];
                var obj = {
                    Header: c.display,
                    accessor: columnName
                };
                return obj;  
            })
            return colObjects;
        }
        
        this.state = {
            columns: this.getColumns(),
            data: null,
            pages: null,
            loading: false,
        };
        
        this.fetchData = this.fetchData.bind(this);
    }
    
    componentDidMount() {
        this.fetchData();
    }
    
    componentDidUpdate(pp, ps) {
        // ok to just compare strings, the objects are sorted and numeric comparisons standardized
        if (this.props.objects !== pp.objects || this.props.parameters !== pp.parameters) {
            this.fetchData();
        }
    }
    
    fetchData(state, instance) {
        console.log(state);
        this.setState({ loading: true });
        var queryJSON = {
            pageSize: 20,
            page: 1,
            parameters: JSON.parse(this.props.parameters)
        }
        const flattenData = (row) => {
            var obj = { zooid: row.zooid };
            Object.keys(row.index).forEach(function(key) { obj[key] = row.index[key]; });
            Object.keys(row.bool).forEach(function(key) { obj[key] = row.bool[key]; });
            Object.keys(row.numeric).forEach(function(key) { obj[key] = row.numeric[key]; });
            return obj;
        }
        if (typeof state !== 'undefined') {
            queryJSON.pageSize = state.pageSize;
            queryJSON.page = state.page;
        }
        
        this.props.postData('/results/' + this.props.objects, queryJSON).then(data => {
            this.setState({
                data: data.map(flattenData), 
                pages: Math.ceil(this.props.counter/queryJSON.pageSize),
                loading: false
            });
        }).catch(error => console.error(error));
    }
    
    render() {
        const { data, pages, loading } = this.state;
        return (
            <section id="results">
                <Container>
                    <Row>
                        <Col lg="12">
                            <div className="table-responsive">
                                {this.state.data !== null &&
                                    <ReactTable manual
                                        data={this.state.data} 
                                        columns={this.state.columns}
                                        defaultPageSize={20}
                                        pages={this.state.pages}
                                        onFetchData={this.fetchData}
                                        loading={this.state.loading} // Display the loading overlay when we need it
                                    />
                                }
                            </div>
                       </Col>
                    </Row>
                </Container>
            </section>
        );
    }
}



export default ZooResults;