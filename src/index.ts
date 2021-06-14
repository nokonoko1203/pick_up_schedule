import { default as main, deleteAllEventButton } from './main';

// GASではトップレベル関数しか実行できないのでglobalに登録する・globalに登録しておけばgas-webpack-pluginがトップレベルに配置する
declare const global: {
    [key: string]: unknown;
};

global.main = main;
global.deleteAllEventButton = deleteAllEventButton;
