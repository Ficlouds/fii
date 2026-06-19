interface RouterInstance {
  apiType: string;
  models?: string[];
  options: {
    accessKeyId?: string;
    accessKeySecret?: string;
    apiKey?: string;
    apiVersion?: string;
    baseURL?: string;
    baseURLOrAccountID?: string;
    dangerouslyAllowBrowser?: boolean;
    region?: string;
    sessionToken?: string;
  };
}

interface FiRouterRuntimeOptions {
  id: string;
  routers: (options: any, runtimeContext: { model?: string }) => Promise<RouterInstance[]>;
}

export const fiRouterRuntimeOptions: FiRouterRuntimeOptions = {
  id: 'lobehub',

  // eslint-disable-next-line unused-imports/no-unused-vars
  routers: async (options, { model: _model }) => {
    return [];
  },
};
