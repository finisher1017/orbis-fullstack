import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getTwits } from '../actions/searchActions';
import { deleteSymbol } from '../actions/searchActions';
const ta = require('time-ago');
// @TODO
// Convert function component
// implement prop types
class TestDropdownTwits extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showList: false,
            dropdownClass: 'dropdown-content',
            toShow: '',
            toDelete: '',

        }
        this.onSubmit = this.onSubmit.bind(this);
        this.toggleList = this.toggleList.bind(this);
    }

    componentWillMount() {
        this.props.getTwits();
        
    }

    componentDidMount() {
        this.timerID = setInterval(
                () => this.props.getTwits(),
                10000
        )
    }
        
    

    

    onSubmit(e) {
        e.preventDefault();

        this.props.deleteSymbol(e.target.value);
    }

    toggleList(e) {
        if (this.state.showList && this.state.toShow !== e.target.id) {
            this.setState({showList: true, toShow: e.target.id});
        } else {
            this.setState({showList: !this.state.showList, toShow: e.target.id})
        }
    }

    render() {
        const {showList, toShow} = this.state;

        const symbolList = this.props.search.map(symbol => (
            <div key={symbol._id} className="dropdown">
                <button id={symbol.symbol} onClick={this.toggleList} className="twit-button dropbtn">{symbol.twits.length} most recent twits for {symbol.symbol}<button onClick={this.onSubmit} className="delete-button" value={symbol.symbol}>X</button></button>              
                <div className={`${showList && toShow == symbol.symbol ? "dropdown-content" : "hidden-content"}`}>
                    {symbol.twits.sort(function (a,b) {return b.id - a.id}).map(twit => {
                        return (
                        <li key={twit.id}>
                            <p className="user">{twit.username} - {ta.ago(`${twit.stocktwits_timestamp}`)}</p>
                            <p className="post">{twit.body}</p>
                            <hr></hr>
                        </li>
                        )
                    }
                    )}
                </div>
            </div>
        ));
        return (
            <>
            <div className="test-class">
                {symbolList}
            </div>
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

export default connect(mapStateToProps, { getTwits, deleteSymbol })(TestDropdownTwits);