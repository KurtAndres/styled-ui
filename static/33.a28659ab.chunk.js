webpackJsonp([33],{1564:function(e,n,t){var l=t(1),o=t(66),a=t(308).PageRenderer;a.__esModule&&(a=a.default);var r=o({displayName:"WrappedPageRenderer",getInitialState:function(){return{content:t(1620)}},componentWillMount:function(){},render:function(){return l.createElement(a,Object.assign({},this.props,{content:this.state.content}))}});r.__catalog_loader__=!0,e.exports=r},1620:function(e,n){e.exports="An `ImageWell` is a component used to select and display an image.\n\n```react\nshowSource: true\n\nstate: { previewUrl: '' }\n\n---\n\n<ImageWell\n    previewUrl={state.previewUrl}\n    onSelectImage={() => {\n        if (state.previewUrl) {\n            alert(\"Image selected\");\n        }  else {\n            alert(\"Image added\");\n            setState({ previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' });\n        }\n    }}\n    onRemoveImage={() => {\n        setState({ previewUrl: ''});\n        alert(\"Image removed\");\n    }}\n/>\n```\n\n### Default preview image controls\n\nWhen a `previewUrl` is provided, an icon will appear in the upper-right corner of the ImageWell.\n\nIf `onRemoveImage` is provided, an X icon will be shown in the upper-right corner and the function will be passed to the icon's `onClick` handler. The rest of the `ImageWell` can be clicked and will call `onSelectImage`. This is useful if you want to be able to remove an image and also do something when the preview image is clicked, like display it in a lightbox.\n\n```react\nshowSource: true\n\nstate: { previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' }\n\n---\n\n<ImageWell\n    previewUrl={state.previewUrl}\n    onSelectImage={() => {\n        if (state.previewUrl) {\n            alert(\"Image selected\");\n        }  else {\n            setState({ previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' });\n        }\n    }}\n    onRemoveImage={() => {\n        setState({ previewUrl: ''});\n        alert(\"Image removed\");\n    }}\n/>\n```\n\nIf `onRemoveImage` is not provided, a camera icon will be shown in the upper-right corner. Clicking any part of the `ImageWell` will call `onSelectImage`. This is useful if you only want the user to be able to change and not remove an image.\n\n```react\nshowSource: true\n\nstate: { previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' }\n\n---\n\n<ImageWell\n    previewUrl={state.previewUrl}\n    onSelectImage={() => {\n        if (state.previewUrl) {\n            alert(\"Choose a new image\");\n        }\n    }}\n/>\n```\n\n### Preview image size\n\nBy default, the size of the preview image is constrained to fit within the ImageWell. Specifying `fitPreviewToSquare` will scale the image to fit the container.\n\n```react\nshowSource: true\n\n---\n\n<ImageWell\n    fitPreviewToSquare\n    previewUrl={'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs'}\n    onSelectImage={() => {}}\n/>\n\n```\n\n### Custom content\n\n#### ImageWell.SelectContent\n\nProvide `ImageWell.SelectContent` to change what the `ImageWell` displays when there is no `previewUrl`.\n\n```react\nshowSource: true\n\nstate: { previewUrl: '' }\n\n---\n\n<ImageWell\n    previewUrl={state.previewUrl}\n    onSelectImage={() => {\n        if (state.previewUrl) {\n            alert(\"Room layout selected\");\n        }  else {\n            alert(\"Room layout added\");\n            setState({ previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' });\n        }\n    }}\n    onRemoveImage={() => {\n        alert(\"Room layout removed\");\n        setState({ previewUrl: ''});\n    }}\n>\n    <ImageWell.SelectContent>\n        + Add Room Layout\n    </ImageWell.SelectContent>\n</ImageWell>\n```\n\n#### ImageWell.PreviewContent\n\nProvide `ImageWell.PreviewContent` to change what gets displayed over the preview image.\n\n```react\nshowSource: true\n\nstate: { previewUrl: ''}\n\n---\n\n<ImageWell\n    previewUrl={state.previewUrl}\n    onSelectImage={() => {\n        if (state.previewUrl) {\n            alert(\"Room layout selected\");\n        }  else {\n            alert(\"Room layout added\");\n            setState({ previewUrl: 'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs' });\n        }\n    }}\n>\n    <ImageWell.PreviewContent>\n        <ImageWell.RemoveIcon\n            onClick={() => {\n                alert(\"Room layout removed\");\n                setState({ previewUrl: ''});\n            }}\n        />\n        <FavoriteFilled\n            color=\"yellow\"\n            style={{\n                position: 'absolute',\n                top: '6px',\n                left: '6px',\n            }}\n            onClick={(e) => {\n                e.stopPropagation();\n                alert(\"Star clicked\");\n            }}\n        />\n\n    </ImageWell.PreviewContent>\n    <ImageWell.SelectContent>\n        + Add Room Layout\n    </ImageWell.SelectContent>\n</ImageWell>\n```\n\n#### Icons\n\nThe X and camera icons that are shown without custom `ImageWell.PreviewContent` can be used in custom preview content. Provide an `onClick` handler to customize the behavior of the icon, otherwise `onSelectImage` will be called.\n\n```react\nshowSource: true\n\n---\n\n<ImageWell\n    previewUrl={'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs'}\n    onSelectImage={() => alert(\"Image selected\")}\n>\n    <ImageWell.PreviewContent>\n        <ImageWell.RemoveIcon onClick={(e) => {\n            e.stopPropagation();\n            alert(\"Remove icon clicked\");\n        }}/>\n    </ImageWell.PreviewContent>\n</ImageWell>\n```\n\n```react\nshowSource: true\n\n---\n\n<ImageWell\n    previewUrl={'https://files.logoscdn.com/v1/files/30472073/assets/6474223/content.jpg?signature=YJ26qbTG_tyIdVHvhowUOoqT7Bs'}\n    onSelectImage={() => alert(\"Image selected\")}\n>\n    <ImageWell.PreviewContent>\n        <ImageWell.CameraIcon onClick={() => {}} />\n        <FavoriteFilled\n            color=\"yellow\"\n            style={{\n                position: 'absolute',\n                top: '6px',\n                left: '6px',\n            }}\n            onClick={(e) => {\n                e.stopPropagation();\n                alert(\"Star clicked\");\n            }}\n        />\n    </ImageWell.PreviewContent>\n</ImageWell>\n```\n"}});
//# sourceMappingURL=33.a28659ab.chunk.js.map