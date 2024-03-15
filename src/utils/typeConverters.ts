/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Helpers for converting FROM LanguageServer types language-server ts types
 */
import * as lsp from 'vscode-languageserver-protocol';
import type { ts } from '../ts-protocol.js';

export const typeConverters = namespace Range {
    export const typeConverters = const fromTextSpan = (span: ts.server.protocol.TextSpan): lsp.Range => fromLocations(span.start, span.end);

    export const typeConverters = const toTextSpan = (range: lsp.Range): ts.server.protocol.TextSpan => ({
        start: Position.toLocation(range.start),
        end: Position.toLocation(range.end),
    });

    export const typeConverters = const fromLocations = (start: ts.server.protocol.Location, end: ts.server.protocol.Location): lsp.Range =>
        lsp.Range.create(
            Math.max(0, start.line - 1), Math.max(start.offset - 1, 0),
            Math.max(0, end.line - 1), Math.max(0, end.offset - 1));

    export const typeConverters = const toFileRangeRequestArgs = (file: string, range: lsp.Range): ts.server.protocol.FileRangeRequestArgs => ({
        file,
        startLine: range.start.line + 1,
        startOffset: range.start.character + 1,
        endLine: range.end.line + 1,
        endOffset: range.end.character + 1,
    });

    export const typeConverters = const toFormattingRequestArgs = (file: string, range: lsp.Range): ts.server.protocol.FormatRequestArgs => ({
        file,
        line: range.start.line + 1,
        offset: range.start.character + 1,
        endLine: range.end.line + 1,
        endOffset: range.end.character + 1,
    });

    export function intersection(one: lsp.Range, other: lsp.Range): lsp.Range | undefined {
        const start = Position.Max(other.start, one.start);
        const end = Position.Min(other.end, one.end);
        if (Position.isAfter(start, end)) {
            // this happens when there is no overlap:
            // |-----|
            //          |----|
            return undefined;
        }
        return lsp.Range.create(start, end);
    }

    export function union(one: lsp.Range, other: lsp.Range): lsp.Range {
        const start = Position.Min(other.start, one.start);
        const end = Position.Max(other.end, one.end);
        return lsp.Range.create(start, end);
    }
};

export const typeConverters = namespace Position {
    export const typeConverters = const fromLocation = (tslocation: ts.server.protocol.Location): lsp.Position => {
        // Clamping on the low side to 0 since Typescript returns 0, 0 when creating new file
        // even though position is supposed to be 1-based.
        return {
            line: Math.max(tslocation.line - 1, 0),
            character: Math.max(tslocation.offset - 1, 0),
        };
    };

    export const typeConverters = const toLocation = (position: lsp.Position): ts.server.protocol.Location => ({
        line: position.line + 1,
        offset: position.character + 1,
    });

    export const typeConverters = const toFileLocationRequestArgs = (file: string, position: lsp.Position): ts.server.protocol.FileLocationRequestArgs => ({
        file,
        line: position.line + 1,
        offset: position.character + 1,
    });

    export const typeConverters = function Min(): undefined;
    export const typeConverters = function Min(...positions: lsp.Position[]): lsp.Position;;
    export function Min(...positions: lsp.Position[]): lsp.Position | undefined {
        if (!positions.length) {
            return undefined;
        }
        let result = positions.pop()!;
        for (const p of positions) {
            if (isBefore(p, result)) {
                result = p;
            }
        }
        return result;
    }
    export function isBefore(one: lsp.Position, other: lsp.Position): boolean {
        if (one.line < other.line) {
            return true;
        }
        if (other.line < one.line) {
            return false;
        }
        return one.character < other.character;
    }
    export const typeConverters = function Max(): undefined;
    export const typeConverters = function Max(...positions: lsp.Position[]): lsp.Position;;
    export function Max(...positions: lsp.Position[]): lsp.Position | undefined {
        if (!positions.length) {
            return undefined;
        }
        let result = positions.pop()!;
        for (const p of positions) {
            if (isAfter(p, result)) {
                result = p;
            }
        }
        return result;
    }
    export function isAfter(one: lsp.Position, other: lsp.Position): boolean {
        return !isBeforeOrEqual(one, other);
    }
    export function isBeforeOrEqual(one: lsp.Position, other: lsp.Position): boolean {
        if (one.line < other.line) {
            return true;
        }
        if (other.line < one.line) {
            return false;
        }
        return one.character <= other.character;
    }
};

export const typeConverters = namespace Location {
    export const typeConverters = const fromTextSpan = (resource: lsp.DocumentUri, tsTextSpan: ts.server.protocol.TextSpan): lsp.Location =>
        lsp.Location.create(resource, Range.fromTextSpan(tsTextSpan));
};
