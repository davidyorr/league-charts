import type { StorybookConfig } from "@storybook/react-vite";
import { defineConfig, mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-backgrounds", "@storybook/addon-controls"],

  framework: {
    name: "@storybook/react-vite",
    options: {}
  },

  docs: {
    autodocs: false
  },
  async viteFinal(config) {
    return mergeConfig(config, defineConfig({
      server: {
        hmr: {
          protocol: 'ws',
          port: 6006
        }
      }
    }))
  }
};

export default config;