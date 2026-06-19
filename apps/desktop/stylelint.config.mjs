import { stylelint } from '@ficlouds/lint';

export default {
  ...stylelint,
  rules: {
    'selector-id-pattern': null,
    ...stylelint.rules,
  },
};
