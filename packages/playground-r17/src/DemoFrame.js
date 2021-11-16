import React from "react";
import { CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import Frame from "react-frame-component";

/*
Adapted from https://github.com/mui-org/material-ui/blob/master/docs/src/modules/components/DemoSandboxed.js

The MIT License (MIT)

Copyright (c) 2014 Call-Em-All

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function DemoFrame(props) {
  const { children, classes, theme, ...other } = props;
  const [state, setState] = React.useState({
    ready: false,
  });
  const instanceRef = React.useRef();

  const handleRef = React.useCallback(ref => {
    instanceRef.current = {
      contentDocument: ref ? ref.node.contentDocument : null,
      contentWindow: ref ? ref.node.contentWindow : null,
    };
  }, []);

  const onContentDidMount = () => {
    setState({
      ready: true,
      emotionCache: createCache({
        key: "css",
        prepend: true,
        container: instanceRef.current.contentWindow["demo-frame-jss"],
      }),
      container: instanceRef.current.contentDocument.body,
      window: () => instanceRef.current.contentWindow,
    });
  };
  return (
    <Frame ref={handleRef} contentDidMount={onContentDidMount} {...other}>
      {/* We need to wrap the material-ui form in a custom StylesProvider
            so that styles are injected into the iframe, not the parent window. */}
      <div id="demo-frame-jss" />
      {theme === "mui-5" ? (
        state.ready ? (
          <CacheProvider value={state.emotionCache}>
            <CssBaseline />
            {React.cloneElement(children, {
              container: state.container,
              window: state.window,
            })}
          </CacheProvider>
        ) : null
      ) : (
        children
      )}
    </Frame>
  );
}

export default DemoFrame;
