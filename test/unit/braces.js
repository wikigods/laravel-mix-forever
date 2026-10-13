import test from 'ava';
import braces from 'braces';

test('brace patterns with safe nesting still expand', t => {
    t.deepEqual(braces.expand('{a,{b,c}}'), ['a', 'b', 'c']);
});

test('brace patterns with excessive nesting are rejected', t => {
    const pattern = `${'{'.repeat(101)}x${'}'.repeat(101)}`;

    t.throws(() => braces(pattern), {
        instanceOf: SyntaxError,
        message: /nesting depth exceeds the maximum of 100/
    });
});
