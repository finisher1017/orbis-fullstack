import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getTwits } from '../actions/searchActions';
import { deleteSymbol } from '../actions/searchActions';

class TwitsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toDelete: ''
        }
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentWillMount() {
        this.props.getTwits();
        
    }

    onSubmit(e) {
        e.preventDefault();

        this.props.deleteSymbol(e.target.value);
    }

    expandTwits() {
        document.getElementById("twits").classList.toggle("show");
    }
    render() {
        const symbolList = this.props.search.map(symbol => (
            <div key={symbol._id}>
                <h3>{symbol.twits.length} {symbol.symbol} Twits</h3>
                <button>twits</button>
                <button onClick={this.onSubmit} value={symbol.symbol}>delete</button>
                {symbol.twits.map(twit => (
                    <div id="twits" className="dropdown-content" key={twit.id}>
                        <h4>{twit.username}</h4>
                        <h4>{twit.stocktwits_timestamp}</h4>
                        <h4>{twit.body}</h4>
                        <hr/>
                    </div>
                    ))
                }
            </div>
        ))
        return (
            <>
            <h1>Twits</h1>
            {symbolList}
            </>
        );
    }
};

// Search.propTypes = {
//     getTwits: PropTypes.func.isRequired,
//     search: PropTypes.array.isRequired
// }

const mapStateToProps = state => ({
    search: state.search.symbols
})

export default connect(mapStateToProps, { getTwits, deleteSymbol })(TwitsList);