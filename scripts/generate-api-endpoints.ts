// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import fs from 'node:fs';
// import path from 'node:path';
// import ts from 'typescript';

// type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// type RequestSlot = {
//   typeName: string;
//   shape: unknown;
// };

// type RequestCatalog = {
//   body?: RequestSlot;
//   query?: RequestSlot;
//   params?: RequestSlot;
//   uploadedFile?: RequestSlot;
//   uploadedFiles?: RequestSlot;
// };

// type ResponseCatalog = {
//   typeName: string;
//   shape: unknown;
//   source?: {
//     serviceProperty: string;
//     serviceMethod: string;
//   };
// };

// type EndpointCatalog = {
//   method: HttpMethod;
//   path: string;
//   controller: string;
//   handler: string;
//   authRequired: boolean;
//   public: boolean;
//   roles: string[];
//   guards: string[];
//   request: RequestCatalog;
//   response: ResponseCatalog;
// };

// const HTTP_DECORATORS = new Map<string, HttpMethod>([
//   ['Get', 'GET'],
//   ['Post', 'POST'],
//   ['Put', 'PUT'],
//   ['Patch', 'PATCH'],
//   ['Delete', 'DELETE'],
// ]);

// const REQUEST_DECORATORS = new Set([
//   'Body',
//   'Query',
//   'Param',
//   'UploadedFile',
//   'UploadedFiles',
// ]);

// const MAX_TYPE_DEPTH = 4;
// const projectRoot = process.cwd();

// function main(): void {
//   const configPath = ts.findConfigFile(
//     projectRoot,
//     ts.sys.fileExists,
//     'tsconfig.json',
//   );
//   if (!configPath) {
//     throw new Error('Unable to locate tsconfig.json');
//   }

//   const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
//   if (configFile.error) {
//     throw new Error(formatTsError(configFile.error));
//   }

//   const parsedConfig = ts.parseJsonConfigFileContent(
//     configFile.config,
//     ts.sys,
//     path.dirname(configPath),
//   );

//   if (parsedConfig.errors.length > 0) {
//     throw new Error(parsedConfig.errors.map(formatTsError).join('\n'));
//   }

//   const program = ts.createProgram({
//     rootNames: parsedConfig.fileNames,
//     options: parsedConfig.options,
//   });
//   const checker = program.getTypeChecker();

//   const globalPrefix = resolveGlobalPrefix(projectRoot);
//   const controllerFiles = program
//     .getSourceFiles()
//     .filter(
//       (file) =>
//         !file.isDeclarationFile &&
//         normalizePath(file.fileName).includes('/src/modules/') &&
//         file.fileName.endsWith('.controller.ts'),
//     );

//   const endpoints: EndpointCatalog[] = [];
//   for (const sourceFile of controllerFiles) {
//     endpoints.push(
//       ...extractControllerEndpoints({
//         checker,
//         sourceFile,
//         globalPrefix,
//       }),
//     );
//   }

//   endpoints.sort((left, right) => {
//     const pathCompare = left.path.localeCompare(right.path);
//     if (pathCompare !== 0) {
//       return pathCompare;
//     }

//     return httpMethodOrder(left.method) - httpMethodOrder(right.method);
//   });

//   const docsDir = path.join(projectRoot, 'docs');
//   fs.mkdirSync(docsDir, { recursive: true });

//   const jsonPath = path.join(docsDir, 'api-endpoints.json');
//   const mdPath = path.join(docsDir, 'api-endpoints.md');

//   const jsonPayload = {
//     generatedAt: new Date().toISOString(),
//     globalPrefix,
//     endpointCount: endpoints.length,
//     endpoints,
//   };

//   fs.writeFileSync(
//     jsonPath,
//     JSON.stringify(jsonPayload, null, 2) + '\n',
//     'utf8',
//   );
//   fs.writeFileSync(mdPath, renderMarkdown(jsonPayload), 'utf8');

//   process.stdout.write(
//     `Generated ${endpoints.length} endpoints:\n- ${relativePath(mdPath)}\n- ${relativePath(jsonPath)}\n`,
//   );
// }

// function extractControllerEndpoints(args: {
//   checker: ts.TypeChecker;
//   sourceFile: ts.SourceFile;
//   globalPrefix: string;
// }): EndpointCatalog[] {
//   const { checker, sourceFile, globalPrefix } = args;
//   const endpoints: EndpointCatalog[] = [];

//   for (const statement of sourceFile.statements) {
//     if (!ts.isClassDeclaration(statement) || !statement.name) {
//       continue;
//     }

//     const classDecorators = getDecorators(statement);
//     const controllerDecorator = classDecorators.find(
//       (decorator) => decorator.name === 'Controller',
//     );
//     if (!controllerDecorator) {
//       continue;
//     }

//     const controllerName = statement.name.text;
//     const baseRoute = getRoutePath(controllerDecorator.args[0]);
//     const classGuards = getDecoratorArgs(classDecorators, 'UseGuards');
//     const classRoles = getDecoratorArgs(classDecorators, 'Roles');
//     const classIsPublic = hasDecorator(classDecorators, 'Public');

//     for (const member of statement.members) {
//       if (!ts.isMethodDeclaration(member) || !member.body || !member.name) {
//         continue;
//       }

//       const methodDecorators = getDecorators(member);
//       const httpDecorator = methodDecorators.find((decorator) =>
//         HTTP_DECORATORS.has(decorator.name),
//       );
//       if (!httpDecorator) {
//         continue;
//       }

//       const methodName = member.name.getText(sourceFile);
//       const routePath = getRoutePath(httpDecorator.args[0]);
//       const fullPath = joinPath(globalPrefix, baseRoute, routePath);
//       const httpMethod = HTTP_DECORATORS.get(httpDecorator.name)!;
//       const methodGuards = getDecoratorArgs(methodDecorators, 'UseGuards');
//       const methodRoles = getDecoratorArgs(methodDecorators, 'Roles');
//       const isPublic =
//         classIsPublic || hasDecorator(methodDecorators, 'Public');

//       const request = extractRequestCatalog({
//         checker,
//         sourceFile,
//         method: member,
//       });
//       const response = extractResponseCatalog({
//         checker,
//         sourceFile,
//         method: member,
//       });

//       endpoints.push({
//         method: httpMethod,
//         path: fullPath,
//         controller: controllerName,
//         handler: methodName,
//         authRequired: !isPublic,
//         public: isPublic,
//         roles: unique([...classRoles, ...methodRoles]),
//         guards: unique([...classGuards, ...methodGuards]),
//         request,
//         response,
//       });
//     }
//   }

//   return endpoints;
// }

// function extractRequestCatalog(args: {
//   checker: ts.TypeChecker;
//   sourceFile: ts.SourceFile;
//   method: ts.MethodDeclaration;
// }): RequestCatalog {
//   const { checker, sourceFile, method } = args;
//   const request: RequestCatalog = {};

//   for (const parameter of method.parameters) {
//     const decorator = getDecorators(parameter).find((entry) =>
//       REQUEST_DECORATORS.has(entry.name),
//     );
//     if (!decorator) {
//       continue;
//     }

//     const type = checker.getTypeAtLocation(parameter);
//     const typeName = normalizeTypeName(checker.typeToString(type, parameter));
//     const shape = typeToShape(checker, type, sourceFile, 0, new Set<number>());
//     const namedArg = tryGetStringLiteral(decorator.args[0]);

//     if (decorator.name === 'Body') {
//       request.body = request.body ?? {
//         typeName,
//         shape: {},
//       };
//       request.body.shape = mergeNamedShape(request.body.shape, namedArg, shape);
//       continue;
//     }

//     if (decorator.name === 'Query') {
//       request.query = request.query ?? {
//         typeName,
//         shape: {},
//       };
//       request.query.shape = mergeNamedShape(
//         request.query.shape,
//         namedArg,
//         shape,
//       );
//       continue;
//     }

//     if (decorator.name === 'Param') {
//       request.params = request.params ?? {
//         typeName,
//         shape: {},
//       };
//       request.params.shape = mergeNamedShape(
//         request.params.shape,
//         namedArg,
//         shape,
//       );
//       continue;
//     }

//     if (decorator.name === 'UploadedFile') {
//       request.uploadedFile = {
//         typeName,
//         shape,
//       };
//       continue;
//     }

//     if (decorator.name === 'UploadedFiles') {
//       request.uploadedFiles = {
//         typeName,
//         shape,
//       };
//     }
//   }

//   return request;
// }

// function extractResponseCatalog(args: {
//   checker: ts.TypeChecker;
//   sourceFile: ts.SourceFile;
//   method: ts.MethodDeclaration;
// }): ResponseCatalog {
//   const { checker, sourceFile, method } = args;
//   const serviceCall = findPrimaryServiceCall(method);

//   if (serviceCall) {
//     const signature = checker.getResolvedSignature(serviceCall.callExpression);
//     if (signature) {
//       const returnType = checker.getReturnTypeOfSignature(signature);
//       const unwrappedType =
//         checker.getPromisedTypeOfPromise(returnType) ?? returnType;
//       const typeName = normalizeTypeName(
//         checker.typeToString(unwrappedType, method),
//       );
//       const shape = typeToShape(
//         checker,
//         unwrappedType,
//         sourceFile,
//         0,
//         new Set<number>(),
//       );

//       return {
//         typeName,
//         shape,
//         source: {
//           serviceProperty: serviceCall.serviceProperty,
//           serviceMethod: serviceCall.serviceMethod,
//         },
//       };
//     }
//   }

//   const fallbackReturnType = extractMethodReturnType(
//     checker,
//     method,
//     sourceFile,
//   );
//   return {
//     typeName: fallbackReturnType.typeName,
//     shape: fallbackReturnType.shape,
//   };
// }

// function extractMethodReturnType(
//   checker: ts.TypeChecker,
//   method: ts.MethodDeclaration,
//   sourceFile: ts.SourceFile,
// ): { typeName: string; shape: unknown } {
//   if (!method.body) {
//     return {
//       typeName: 'void',
//       shape: null,
//     };
//   }

//   const statements = method.body.statements;
//   for (let index = statements.length - 1; index >= 0; index -= 1) {
//     const statement = statements[index];
//     if (!ts.isReturnStatement(statement) || !statement.expression) {
//       continue;
//     }

//     const returnType = checker.getTypeAtLocation(statement.expression);
//     return {
//       typeName: normalizeTypeName(checker.typeToString(returnType, method)),
//       shape: typeToShape(checker, returnType, sourceFile, 0, new Set<number>()),
//     };
//   }

//   return {
//     typeName: 'void',
//     shape: null,
//   };
// }

// function findPrimaryServiceCall(method: ts.MethodDeclaration):
//   | {
//       callExpression: ts.CallExpression;
//       serviceProperty: string;
//       serviceMethod: string;
//     }
//   | undefined {
//   if (!method.body) {
//     return undefined;
//   }

//   const variablesToCalls = new Map<string, ts.CallExpression>();
//   const allServiceCalls: Array<{
//     callExpression: ts.CallExpression;
//     serviceProperty: string;
//     serviceMethod: string;
//   }> = [];

//   const visit = (node: ts.Node): void => {
//     if (
//       ts.isVariableDeclaration(node) &&
//       ts.isIdentifier(node.name) &&
//       node.initializer
//     ) {
//       const callExpression = unwrapCallExpression(node.initializer);
//       if (callExpression) {
//         const serviceCall = parseServiceCall(callExpression);
//         if (serviceCall) {
//           variablesToCalls.set(node.name.text, callExpression);
//           allServiceCalls.push(serviceCall);
//         }
//       }
//     }

//     if (ts.isReturnStatement(node) && node.expression) {
//       const returnDataCall = findDataCallInReturn(
//         node.expression,
//         variablesToCalls,
//       );
//       if (returnDataCall) {
//         const serviceCall = parseServiceCall(returnDataCall);
//         if (serviceCall) {
//           allServiceCalls.unshift(serviceCall);
//         }
//       }
//     }

//     ts.forEachChild(node, visit);
//   };

//   visit(method.body);
//   return allServiceCalls[0];
// }

// function findDataCallInReturn(
//   expression: ts.Expression,
//   variablesToCalls: Map<string, ts.CallExpression>,
// ): ts.CallExpression | undefined {
//   const directCall = unwrapCallExpression(expression);
//   if (directCall) {
//     return directCall;
//   }

//   if (!ts.isObjectLiteralExpression(expression)) {
//     return undefined;
//   }

//   for (const property of expression.properties) {
//     if (
//       ts.isShorthandPropertyAssignment(property) &&
//       property.name.text === 'data'
//     ) {
//       return variablesToCalls.get('data');
//     }

//     if (!ts.isPropertyAssignment(property)) {
//       continue;
//     }

//     const propertyName = property.name.getText();
//     if (propertyName !== 'data') {
//       continue;
//     }

//     if (ts.isIdentifier(property.initializer)) {
//       return variablesToCalls.get(property.initializer.text);
//     }

//     const callExpression = unwrapCallExpression(property.initializer);
//     if (callExpression) {
//       return callExpression;
//     }
//   }

//   return undefined;
// }

// function parseServiceCall(callExpression: ts.CallExpression):
//   | {
//       callExpression: ts.CallExpression;
//       serviceProperty: string;
//       serviceMethod: string;
//     }
//   | undefined {
//   if (!ts.isPropertyAccessExpression(callExpression.expression)) {
//     return undefined;
//   }

//   const methodAccess = callExpression.expression;
//   if (!ts.isPropertyAccessExpression(methodAccess.expression)) {
//     return undefined;
//   }

//   const serviceAccess = methodAccess.expression;
//   if (!ts.isThis(serviceAccess.expression)) {
//     return undefined;
//   }

//   return {
//     callExpression,
//     serviceProperty: serviceAccess.name.text,
//     serviceMethod: methodAccess.name.text,
//   };
// }

// function unwrapCallExpression(
//   expression: ts.Expression,
// ): ts.CallExpression | undefined {
//   if (ts.isAwaitExpression(expression)) {
//     return unwrapCallExpression(expression.expression);
//   }

//   if (ts.isCallExpression(expression)) {
//     return expression;
//   }

//   return undefined;
// }

// function typeToShape(
//   checker: ts.TypeChecker,
//   type: ts.Type,
//   locationNode: ts.Node,
//   depth: number,
//   visited: Set<number>,
// ): unknown {
//   if (depth > MAX_TYPE_DEPTH) {
//     return normalizeTypeName(checker.typeToString(type, locationNode));
//   }

//   const typeId = (type as ts.Type & { id?: number }).id;
//   if (typeof typeId === 'number') {
//     if (visited.has(typeId)) {
//       return normalizeTypeName(checker.typeToString(type, locationNode));
//     }

//     visited.add(typeId);
//   }

//   if (type.flags & ts.TypeFlags.StringLiteral) {
//     return (type as ts.StringLiteralType).value;
//   }

//   if (type.flags & ts.TypeFlags.NumberLiteral) {
//     return (type as ts.NumberLiteralType).value;
//   }

//   if (type.flags & ts.TypeFlags.BooleanLiteral) {
//     return normalizeTypeName(checker.typeToString(type, locationNode));
//   }

//   if (type.flags & ts.TypeFlags.StringLike) {
//     return 'string';
//   }

//   if (type.flags & ts.TypeFlags.NumberLike) {
//     return 'number';
//   }

//   if (type.flags & ts.TypeFlags.BooleanLike) {
//     return 'boolean';
//   }

//   if (type.flags & ts.TypeFlags.BigIntLike) {
//     return 'bigint';
//   }

//   if (type.flags & ts.TypeFlags.Null) {
//     return 'null';
//   }

//   if (type.flags & ts.TypeFlags.Undefined) {
//     return 'undefined';
//   }

//   if (type.flags & ts.TypeFlags.Any) {
//     return 'any';
//   }

//   if (type.flags & ts.TypeFlags.Unknown) {
//     return 'unknown';
//   }

//   if (type.flags & ts.TypeFlags.Void) {
//     return 'void';
//   }

//   if (type.isUnion()) {
//     const unionShapes = type.types.map((entry) =>
//       typeToShape(
//         checker,
//         entry,
//         locationNode,
//         depth + 1,
//         new Set<number>(visited),
//       ),
//     );
//     return uniqueShapes(unionShapes);
//   }

//   if (type.isIntersection()) {
//     return normalizeTypeName(checker.typeToString(type, locationNode));
//   }

//   const promisedType = checker.getPromisedTypeOfPromise(type);
//   if (promisedType) {
//     return typeToShape(
//       checker,
//       promisedType,
//       locationNode,
//       depth + 1,
//       new Set<number>(visited),
//     );
//   }

//   if (checker.isArrayType(type)) {
//     const typeReference = type as ts.TypeReference;
//     const elementType = checker.getTypeArguments(typeReference)[0];
//     return [
//       elementType
//         ? typeToShape(
//             checker,
//             elementType,
//             locationNode,
//             depth + 1,
//             new Set<number>(visited),
//           )
//         : 'unknown',
//     ];
//   }

//   if (checker.isTupleType(type)) {
//     const tupleReference = type as ts.TypeReference;
//     return checker
//       .getTypeArguments(tupleReference)
//       .map((entry) =>
//         typeToShape(
//           checker,
//           entry,
//           locationNode,
//           depth + 1,
//           new Set<number>(visited),
//         ),
//       );
//   }

//   const symbol = type.getSymbol();
//   if (symbol?.name === 'Date') {
//     return 'Date';
//   }

//   const properties = checker.getPropertiesOfType(type);
//   if (properties.length > 0) {
//     if (properties.length > 50) {
//       return normalizeTypeName(checker.typeToString(type, locationNode));
//     }

//     const output: Record<string, unknown> = {};
//     for (const property of properties) {
//       const propertyType = checker.getTypeOfSymbolAtLocation(
//         property,
//         property.valueDeclaration ?? property.declarations?.[0] ?? locationNode,
//       );
//       if (propertyType.getCallSignatures().length > 0) {
//         continue;
//       }

//       const key =
//         property.flags & ts.SymbolFlags.Optional
//           ? `${property.name}?`
//           : property.name;

//       output[key] = typeToShape(
//         checker,
//         propertyType,
//         locationNode,
//         depth + 1,
//         new Set<number>(visited),
//       );
//     }

//     return output;
//   }

//   return normalizeTypeName(checker.typeToString(type, locationNode));
// }

// function mergeNamedShape(
//   existing: unknown,
//   name: string | undefined,
//   shape: unknown,
// ): unknown {
//   if (!name) {
//     return shape;
//   }

//   const safeObject =
//     existing && typeof existing === 'object' && !Array.isArray(existing)
//       ? (existing as Record<string, unknown>)
//       : {};
//   safeObject[name] = shape;
//   return safeObject;
// }

// function getDecorators(
//   node: ts.Node,
// ): Array<{ name: string; args: ts.Expression[] }> {
//   if (!ts.canHaveDecorators(node)) {
//     return [];
//   }

//   const decorators = ts.getDecorators(node);
//   if (!decorators) {
//     return [];
//   }

//   const result: Array<{ name: string; args: ts.Expression[] }> = [];
//   for (const decorator of decorators) {
//     if (ts.isCallExpression(decorator.expression)) {
//       result.push({
//         name: getExpressionName(decorator.expression.expression),
//         args: [...decorator.expression.arguments],
//       });
//       continue;
//     }

//     result.push({
//       name: getExpressionName(decorator.expression),
//       args: [],
//     });
//   }

//   return result;
// }

// function getExpressionName(expression: ts.Expression): string {
//   if (ts.isIdentifier(expression)) {
//     return expression.text;
//   }

//   if (ts.isPropertyAccessExpression(expression)) {
//     return expression.name.text;
//   }

//   return expression.getText();
// }

// function getDecoratorArgs(
//   decorators: Array<{ name: string; args: ts.Expression[] }>,
//   decoratorName: string,
// ): string[] {
//   return decorators
//     .filter((decorator) => decorator.name === decoratorName)
//     .flatMap((decorator) => decorator.args)
//     .map((arg) => {
//       if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
//         return arg.text;
//       }

//       if (ts.isIdentifier(arg)) {
//         return arg.text;
//       }

//       if (ts.isPropertyAccessExpression(arg)) {
//         return arg.getText();
//       }

//       return arg.getText();
//     });
// }

// function hasDecorator(
//   decorators: Array<{ name: string; args: ts.Expression[] }>,
//   decoratorName: string,
// ): boolean {
//   return decorators.some((decorator) => decorator.name === decoratorName);
// }

// function getRoutePath(expression: ts.Expression | undefined): string {
//   if (!expression) {
//     return '';
//   }

//   if (
//     ts.isStringLiteral(expression) ||
//     ts.isNoSubstitutionTemplateLiteral(expression)
//   ) {
//     return expression.text;
//   }

//   return expression.getText().replace(/^['"`]|['"`]$/g, '');
// }

// function tryGetStringLiteral(
//   expression: ts.Expression | undefined,
// ): string | undefined {
//   if (!expression) {
//     return undefined;
//   }

//   if (
//     ts.isStringLiteral(expression) ||
//     ts.isNoSubstitutionTemplateLiteral(expression)
//   ) {
//     return expression.text;
//   }

//   return undefined;
// }

// function joinPath(...segments: string[]): string {
//   const normalized = segments
//     .map((segment) => segment.trim())
//     .filter((segment) => segment.length > 0)
//     .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
//     .filter((segment) => segment.length > 0);

//   if (normalized.length === 0) {
//     return '/';
//   }

//   return `/${normalized.join('/')}`;
// }

// function resolveGlobalPrefix(root: string): string {
//   const mainPath = path.join(root, 'src', 'main.ts');
//   if (!fs.existsSync(mainPath)) {
//     return '/api/v1';
//   }

//   const mainSource = fs.readFileSync(mainPath, 'utf8');
//   const match = /setGlobalPrefix\(\s*['"`]([^'"`]+)['"`]\s*\)/.exec(mainSource);
//   if (!match) {
//     return '/api/v1';
//   }

//   return joinPath(match[1]);
// }

// function unique(values: string[]): string[] {
//   return [...new Set(values)];
// }

// function httpMethodOrder(method: HttpMethod): number {
//   switch (method) {
//     case 'GET':
//       return 0;
//     case 'POST':
//       return 1;
//     case 'PUT':
//       return 2;
//     case 'PATCH':
//       return 3;
//     case 'DELETE':
//       return 4;
//     default:
//       return 99;
//   }
// }

// function normalizeTypeName(typeName: string): string {
//   return typeName.replace(/\s+/g, ' ').trim();
// }

// function uniqueShapes(values: unknown[]): unknown[] {
//   const seen = new Set<string>();
//   const uniqueValues: unknown[] = [];

//   for (const value of values) {
//     const key = JSON.stringify(value);
//     if (seen.has(key)) {
//       continue;
//     }

//     seen.add(key);
//     uniqueValues.push(value);
//   }

//   return uniqueValues;
// }

// function formatTsError(diagnostic: ts.Diagnostic): string {
//   return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
// }

// function normalizePath(filePath: string): string {
//   return filePath.replace(/\\/g, '/');
// }

// function relativePath(filePath: string): string {
//   return normalizePath(path.relative(projectRoot, filePath));
// }

// function renderMarkdown(payload: {
//   generatedAt: string;
//   globalPrefix: string;
//   endpointCount: number;
//   endpoints: EndpointCatalog[];
// }): string {
//   const lines: string[] = [];
//   lines.push('# API Endpoint Catalog');
//   lines.push('');
//   lines.push(`Generated at: ${payload.generatedAt}`);
//   lines.push(`Global prefix: \`${payload.globalPrefix}\``);
//   lines.push(`Total endpoints: **${payload.endpointCount}**`);
//   lines.push('');
//   lines.push(
//     'Auth rule: routes are treated as protected by default because `JwtAuthGuard` is registered globally; `@Public()` marks public routes.',
//   );
//   lines.push('');

//   for (const endpoint of payload.endpoints) {
//     lines.push(`## ${endpoint.method} ${endpoint.path}`);
//     lines.push('');
//     lines.push(`Controller: \`${endpoint.controller}\``);
//     lines.push(`Handler: \`${endpoint.handler}\``);
//     lines.push(`Auth: ${endpoint.authRequired ? 'Required' : 'Public'}`);
//     lines.push(
//       `Roles: ${endpoint.roles.length > 0 ? endpoint.roles.join(', ') : '-'}`,
//     );
//     lines.push(
//       `Guards: ${endpoint.guards.length > 0 ? endpoint.guards.join(', ') : '-'}`,
//     );
//     lines.push('');
//     lines.push('Request');
//     lines.push('');
//     lines.push('```json');
//     lines.push(JSON.stringify(endpoint.request, null, 2));
//     lines.push('```');
//     lines.push('');
//     lines.push('Response');
//     lines.push('');
//     lines.push(`Type: \`${endpoint.response.typeName}\``);
//     if (endpoint.response.source) {
//       lines.push(
//         `Service source: \`${endpoint.response.source.serviceProperty}.${endpoint.response.source.serviceMethod}()\``,
//       );
//     }
//     lines.push('');
//     lines.push('```json');
//     lines.push(JSON.stringify(endpoint.response.shape, null, 2));
//     lines.push('```');
//     lines.push('');
//   }

//   return lines.join('\n');
// }

// main();
