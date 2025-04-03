import {
  createConnection,
  ProposedFeatures,
} from 'vscode-languageserver/node';
import * as serverCommon from "./server-common"

export function start(){
  const connection = createConnection(ProposedFeatures.all);
  serverCommon.start(connection)
}
