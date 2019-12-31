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
                    {symbol.twits.map(twit => {
                        if (twit.username === 'Zann007') {
                            console.log(twit.username);
                            console.log(twit.body.split(''));
                        }
                        return (
                        <li key={twit.id}>
                            <p class="user">{twit.username} - {ta.ago(`${twit.stocktwits_timestamp}`)}</p>
                            <p class="post">{twit.body}</p>
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