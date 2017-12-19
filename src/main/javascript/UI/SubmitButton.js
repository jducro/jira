import React from 'react';
import { Button } from '@deskpro/react-components';

export class SubmitButton extends Button
{
  render()
  {
    const el = super.render();
    return React.cloneElement(el, { type: 'submit' });
  }
}


