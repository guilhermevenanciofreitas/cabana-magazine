import React, { Component, createRef, useRef } from 'react'
import { FaSearch, FaSyncAlt } from 'react-icons/fa'
import styled from 'styled-components'
import _ from 'lodash'
import './AutoComplete.css'
import { Message, toaster } from 'rsuite'

const AutocompleteContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const SuggestionsBox = styled.div`
  max-height: 300px;
  overflow-y: auto;
  position: fixed;
  background-color: white;
  z-index: 9999;
  border: 1px solid #ccc;
  border-top: none;
`

const Suggestion = styled.div`
  padding: 6px;
  cursor: pointer;
  &:hover,
  &.selected {
    color: white;
    background-color: dodgerblue;
  }
`

const Result = React.createContext()

class AutoComplete extends Component {

  inputRef = createRef()
  suggestionsBoxRef = createRef()
  selectedItemRef = createRef()

  constructor(props) {

    super(props)

    this.state = {
      loading: false,
      data: [],
      query: '',
      selectedIndex: -1,
      boxStyle: { width: 0 }
    }

  }

  componentDidMount() {
    window.addEventListener('resize', this.updatePosition)
    window.addEventListener('scroll', this.updatePosition)
    document.addEventListener('mousedown', this.handleClickOutside)
    this.updatePosition()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updatePosition)
    window.removeEventListener('scroll', this.updatePosition)
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  updatePosition = () => {
    if (this.inputRef.current) {
      const rect = this.inputRef.current.getBoundingClientRect()
      this.setState({ boxStyle: { width: rect.width } })
    }
  }

  handleSearch = async () => {
    await this.handleInputChange()
    this.inputRef.current.focus()
  }

  handleInputChange = async (e) => {
    try {

        const query = e?.target?.value || ''

        this.setState({ query, selectedIndex: 0, loading: true })
        
        const data = await this.props.onSearch(query)

        this.setState({ data })

    } catch (error) {
      const errors = JSON.parse(error.message).erros
      toaster.push(<Message type='error'><b>Mensagem</b><ul style={{marginTop: '10px'}}>{_.map(errors || [], (message, key) => <li key={key}>{message}</li>)}</ul></Message>,{ placement: 'topEnd', duration: 5000 })
    } finally {
        this.setState({ loading: false })
    }
  }

  handleKeyDown = (e) => {
    const { selectedIndex, data } = this.state
    if (e.key === 'ArrowDown') {
      this.setState(
        (prevState) => ({ selectedIndex: Math.min(prevState.selectedIndex + 1, data.length - 1) }),
        this.scrollToSelectedItem
      )
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      this.setState(
        (prevState) => ({ selectedIndex: Math.max(prevState.selectedIndex - 1, 0) }),
        this.scrollToSelectedItem
      )
      e.preventDefault()
    } else if (e.key === 'Enter' && selectedIndex !== -1) {
      this.handleSuggestionClick(data[selectedIndex])
      this.setState({ data: [] })
    }
  }

  scrollToSelectedItem = () => {
    if (this.selectedItemRef.current && this.suggestionsBoxRef.current) {
      this.selectedItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }

  handleBlur = () => {
    setTimeout(() => this.setState({ query: '', data: [] }), 200)
  }

  handleClickOutside = (event) => {
    if (
      this.suggestionsBoxRef.current &&
      !this.suggestionsBoxRef.current.contains(event.target) &&
      this.inputRef.current &&
      !this.inputRef.current.contains(event.target)
    ) {
        this.setState({ query: '', data: [] })
    }
  }

  handleSuggestionClick = (item) => {
    this.props.onChange(item)
    this.setState({ query: '', data: [] })
  }

  handleClear = () => {
    this.setState({ query: '' })
    this.props.onChange(undefined)
    this.inputRef.current?.focus()
  }

  render() {

    const { label, text, value, children, autoFocus } = this.props
    const { query, data, selectedIndex, boxStyle, loading } = this.state

    return (
      <AutocompleteContainer>
        <div className="textfield-filled right-inner-addon">
          <span className="right">
            {loading ? (
              <FaSyncAlt className='animated rotate' color='#696969' />
            ) : value ? (
              <div style={{ cursor: 'pointer' }} onClick={this.handleClear}>&#x2715;</div>
            ) : (
              <FaSearch style={{ cursor: 'pointer' }} onClick={this.handleSearch} />
            )}
          </span>
          <input
            ref={this.inputRef}
            className='input-search'
            placeholder={!value ? '' : text(value)}
            value={query}
            onChange={this.handleInputChange}
            onKeyDown={this.handleKeyDown}
            onBlur={this.handleBlur}
            autoFocus={autoFocus}
          />
          <span>{label}</span>
        </div>
        {_.size(data) > 0 && (
          <SuggestionsBox ref={this.suggestionsBoxRef} style={{ width: `${boxStyle.width}px` }} tabIndex={-1}>
            {_.map(data, (item, index) => (
              <Suggestion
                key={index}
                ref={index === selectedIndex ? this.selectedItemRef : null}
                className={index === selectedIndex ? 'selected' : ''}
                onClick={() => this.handleSuggestionClick(item)}
              >
                <Result.Provider value={item}>{children}</Result.Provider>
              </Suggestion>
            ))}
          </SuggestionsBox>
        )}
      </AutocompleteContainer>
    )
  }
}

AutoComplete.Result = Result.Consumer

export const ControlAutoComplete = AutoComplete