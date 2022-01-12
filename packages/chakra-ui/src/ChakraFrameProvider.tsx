import * as React from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import weakMemoize from "@emotion/weak-memoize";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

/**
 * __createChakraFrameProvider is used to ensure that <Global> emotion components
 * can be rendered within an iframe without changing the styles of the parent page.
 * Required for using Chakra UI in the playground.
 *
 * We have to define ChakraFrameProvider in this library, as opposed to the playground,
 * in order to avoid conflicting versions of emotion, which breaks the styling.
 *
 * NOTE: This is an internal component only used by @rjsf/playground (no
 * backwards compatibility guarantees!)
 *
 * From: https://codesandbox.io/s/p98y9o7jz0?file=/src/frame-provider.js:0-650
 * Also see: https://github.com/emotion-js/emotion/issues/760#issuecomment-404353706
 */

let memoizedCreateCacheWithContainer = weakMemoize((container: HTMLElement) => {
  let newCache = createCache({ container, key: "rjsf" });
  return newCache;
});

export const __createChakraFrameProvider = (props: any) => ({
  document,
}: any) => {
  const customTheme = extendTheme(
    withDefaultColorScheme({ colorScheme: "blue" }),
    {
      styles: {
        global: {
          /**
           * This is required since Chakra UI bulldozes default browser styles with `<CSSReset />`
           * See: https://github.com/chakra-ui/chakra-ui/blob/main/packages/css-reset/src/css-reset.tsx
           *
           * Disabling CSSReset would make the need for similar styles to be applied across the Chakra UI library.
           * Noteably, `box-sizing: border-box` on `input` elements, as Chakra default theme relies heavily on this.
           *
           * These button styles are the minimal amount required to make the button look like the default browser styles.
           */
          button: {
            padding: "1px 6px",
            borderStyle: "outset",
            borderWidth: 2,
            background: "rgb(239, 239, 239)",
          },
        },
      },
    }
  );

  return (
    <div style={{ margin: 2 }}>
      <CacheProvider value={memoizedCreateCacheWithContainer(document.head)}>
        <ChakraProvider theme={customTheme}>{props.children}</ChakraProvider>
      </CacheProvider>
    </div>
  );
};
