import React from 'react';
import { Editor, EditorState, getDefaultKeyBinding, RichUtils, convertToRaw, ContentState, ContentBlock } from 'draft-js';
import './RichText.css'
import '../../node_modules/draft-js/dist/Draft.css'
import { NotesApiService } from '../services/NotesApiService';

class RichTextEditor extends React.Component {
    constructor(props) {
      super(props);
      this.state = {editorState: EditorState.createEmpty()};

      this.focus = () => this.refs.editor.focus();
      this.onChange = (editorState) => this.setState({editorState});

      this.handleKeyCommand = this._handleKeyCommand.bind(this);
      this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
      this.toggleBlockType = this._toggleBlockType.bind(this);
      this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    _handleKeyCommand(command, editorState) {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this.onChange(newState);
        return true;
      }
      return false;
    }

    _mapKeyToEditorCommand(e) {
      if (e.keyCode === 9 /* TAB */) {
        const newEditorState = RichUtils.onTab(
          e,
          this.state.editorState,
          4, /* maxDepth */
        );
        if (newEditorState !== this.state.editorState) {
          this.onChange(newEditorState);
        }
        return;
      }
      return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
      this.onChange(
        RichUtils.toggleBlockType(
          this.state.editorState,
          blockType
        )
      );
    }

    _toggleInlineStyle(inlineStyle) {
      this.onChange(
        RichUtils.toggleInlineStyle(
          this.state.editorState,
          inlineStyle
        )
      );
    }

    formatData(data){
      console.log("FORMAT DATA: ", data);
      const dataTemplate = {
        id: '123',
        words: '123',
        rowPosition: 0,
        style: '',
      }

      const formattedData = data.map((item, index) => {
        return {
          id: item.key || dataTemplate.id,
          words: item.text || dataTemplate.words,
          rowPosition: index || dataTemplate.rowPosition,
          style: item.type || dataTemplate.style,
        };
      });
    
      console.log("Formatted Data: ", formattedData);
      return formattedData;
    }

    getCurrentContent() {
      const contentState = this.state.editorState.getCurrentContent();
      const arrayOfRows = convertToRaw(contentState).blocks;
      return arrayOfRows;
    }

    componentDidMount() {
      this.fetchData();
    }

    sortData(data) {
      return data.sort((a, b) => parseInt(a.rowPosition, 10) - parseInt(b.rowPosition, 10));
    };
  
    fetchData = async () => {
      try {
        const data = await NotesApiService.getNotesEntryApi();
        const sortedData = this.sortData(data);

        const contentBlocks = sortedData.map(item => {
          const blockKey = `${item.id}`;
          const block = new ContentBlock({
            key: blockKey,
            text: item.words,
            type: item.style,
          });
    
          return block;
        });

        console.log("contentBlocks: ", contentBlocks)

        const contentState = ContentState.createFromBlockArray(contentBlocks);
        const newEditorState = EditorState.createWithContent(contentState);
    
        this.setState({ editorState: newEditorState });


      } catch (error) {
        console.error('Error fetching and setting data:', error);
      }
    };

    async saveContent() {
      const data = this.getCurrentContent();
      // localStorage.setItem("savedContent", json);
      console.log("SAVED")
      console.log("TEST DATA SASVED: ", data)

      const dataToSubmit = {
        content: this.formatData(data)
      }

      await NotesApiService.saveNotesEntryApi(dataToSubmit)

    }

    render() {
      const {editorState} = this.state;

      // If the user changes block type before entering any text, we can
      // either style the placeholder or hide it. Let's just hide it now.
      let className = 'RichEditor-editor';
      var contentState = editorState.getCurrentContent();
      if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
          className += ' RichEditor-hidePlaceholder';
        }
      }

      return (
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={this.mapKeyToEditorCommand}
              onChange={this.onChange}
              placeholder="Tell a story..."
              ref="editor"
              spellCheck={true}
            />
          </div>
          <button onClick={this.saveContent.bind(this)}>Save Content</button>
        </div>
      );
    }
  }

  // Custom overrides for "code" style.
  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  }

  class StyleButton extends React.Component {
    constructor() {
      super();
      this.onToggle = (e) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
      };
    }

    render() {
      let className = 'RichEditor-styleButton';
      if (this.props.active) {
        className += ' RichEditor-activeButton';
      }

      return (
        <span className={className} onMouseDown={this.onToggle}>
          {this.props.label}
        </span>
      );
    }
  }

  const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
  ];

  const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };

  var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
  ];

  const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();
    
    return (
      <div className="RichEditor-controls">
        {INLINE_STYLES.map((type) =>
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };

  export default RichTextEditor;