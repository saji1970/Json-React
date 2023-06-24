import { useState } from "react";


const COLORS = ['red', 'green', 'blue'];


// @ts-ignore
export default function SpecialInput({ onChange, formData }) {
    const [text, setText] = useState<string>(formData || '');

    const inputBgColor = COLORS[text.length % COLORS.length]

    return (
        <div className='SpecialInput'>
          <h3>Hey, I&apos;m a custom component</h3>
          <p>
            I&apos;m registered as <code>geo</code> and referenced in
            <code>uiSchema</code> as the <code>ui:field</code> to use for this schema.
          </p>
          <div className='row'>
            <div className='col-sm-6'>
              <label>SpecialInput</label>
              <input
                className='form-control'
                style={{ background: inputBgColor, color: 'white', fontSize: 14 }}
                value={text}
                onChange={({ target: { value }}) => {
                  onChange(value)
                  setText(value)
                }}
              />
            </div>
          </div>
        </div>
      );
}