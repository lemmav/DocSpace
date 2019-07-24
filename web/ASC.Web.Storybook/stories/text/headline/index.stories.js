import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, withKnobs, select } from '@storybook/addon-knobs/react';
import { Text } from 'asc-web-components';
import Section from '../../../.storybook/decorators/section';
import withReadme from 'storybook-readme/with-readme';
import Readme from './README.md';

const tag = ['h1', 'h2', 'h3'];

storiesOf('Components|Text', module)
  .addDecorator(withKnobs)
  .addDecorator(withReadme(Readme))
  .add('headline', () => (

    <Section>
      <div style={{ width: "100%" }}>
        <Text.Headline
          tag={select('tag', tag, 'h1')}
          title={text('title', '')}
          truncate={boolean('truncate', false)}
          isDisabled={boolean('isDisabled', false)}
          isInline={boolean('isInline', false)}
        >
          {text('Text', 'Sample text Headline')}
        </Text.Headline>
      </div>
    </Section>
  ));