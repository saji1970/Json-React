import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import {
  dataURItoBlob,
  getTemplate,
  FormContextType,
  Registry,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
  WidgetProps,
} from '@rjsf/utils';
import Markdown from 'markdown-to-jsx';

function addNameToDataURL(dataURL: string, name: string) {
  if (dataURL === null) {
    return null;
  }
  return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}

type FileInfoType = {
  dataURL?: string | null;
  name: string;
  size: number;
  type: string;
};

function processFile(file: File): Promise<FileInfoType> {
  const { name, size, type } = file;
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        resolve({
          dataURL: addNameToDataURL(event.target.result, name),
          name,
          size,
          type,
        });
      } else {
        resolve({
          dataURL: null,
          name,
          size,
          type,
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

function processFiles(files: FileList) {
  return Promise.all(Array.from(files).map(processFile));
}

function FilesInfo<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  filesInfo,
  registry,
}: {
  filesInfo: { name: string; size: number; type: string }[];
  registry: Registry<T, S, F>;
}) {
  if (filesInfo.length === 0) {
    return null;
  }
  const { translateString } = registry;
  return (
    <ul className='file-info'>
      {filesInfo.map((fileInfo, key) => {
        const { name, size, type } = fileInfo;
        return (
          <li key={key}>
            <Markdown>
              {translateString(TranslatableString.FilesInfo, [
                name,
                type,
                String(size),
              ])}
            </Markdown>
          </li>
        );
      })}
    </ul>
  );
}

function extractFileInfo(dataURLs: string[]) {
  return dataURLs
    .filter((dataURL) => dataURL)
    .map((dataURL) => {
      const { blob, name } = dataURItoBlob(dataURL);
      return {
        name: name,
        size: blob.size,
        type: blob.type,
      };
    });
}

/**
 *  The `FileWidget` is a widget for rendering file upload fields.
 *  It is typically used with a string property with data-url format.
 */
function FileWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const { disabled, readonly, multiple, onChange, value, options, registry } =
    props;
  const BaseInputTemplate = getTemplate<'BaseInputTemplate', T, S, F>(
    'BaseInputTemplate',
    registry,
    options
  );
  const extractedFilesInfo = useMemo(
    () =>
      Array.isArray(value) ? extractFileInfo(value) : extractFileInfo([value]),
    [value]
  );
  const [filesInfo, setFilesInfo] =
    useState<FileInfoType[]>(extractedFilesInfo);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      processFiles(event.target.files).then((filesInfoEvent) => {
        setFilesInfo(filesInfoEvent);
        const newValue = filesInfoEvent.map((fileInfo) => fileInfo.dataURL);
        if (multiple) {
          onChange(newValue);
        } else {
          onChange(newValue[0]);
        }
      });
    },
    [multiple, onChange]
  );

  return (
    <div>
      <BaseInputTemplate
        {...props}
        disabled={disabled || readonly}
        type='file'
        onChangeOverride={handleChange}
        value=''
        accept={options.accept ? String(options.accept) : undefined}
      />
      <FilesInfo<T, S, F> filesInfo={filesInfo} registry={registry} />
    </div>
  );
}

export default FileWidget;
